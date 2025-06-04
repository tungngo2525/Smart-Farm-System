/*
 * dht20.c
 *
 *  Created on: Dec 21, 2024
 *      Author: tungn
 */
#include "dht20.h"

extern I2C_HandleTypeDef hi2c1;
extern UART_HandleTypeDef huart2;

#define SLAVE_ADDRESS_DHT20 (0x38 << 1)

uint16_t value_x10[2] = {0, 0};
char temp[20], humid[20];
int status = INIT;
uint16_t T, H;
void dht20_init(void){

	uint8_t init[3];

	init[0] = 0xA8;
	init[1] = 0x00;
	init[2] = 0x00;
	HAL_I2C_Master_Transmit(&hi2c1, SLAVE_ADDRESS_DHT20, (uint8_t*) init, 3, 0xFF);
	HAL_Delay(20);

	init[0] = 0xBE;
	init[1] = 0x08;
	init[2] = 0x00;
	HAL_I2C_Master_Transmit(&hi2c1, SLAVE_ADDRESS_DHT20, (uint8_t*) init, 3, 0xFF);
	HAL_Delay(20);
}

void dht20_reset(uint8_t regist){

	uint8_t reset[3], reply[3];

	reset[0] = regist;
	reset[1] = 0x00;
	reset[2] = 0x00;
 	HAL_I2C_Master_Transmit(&hi2c1, SLAVE_ADDRESS_DHT20, (uint8_t*) reset, 3, 0xFF);
	HAL_Delay(10);

	HAL_I2C_Master_Receive(&hi2c1, SLAVE_ADDRESS_DHT20 | 0x01, (uint8_t*) reply, 3, 0xFF);
	reset[0] = 0xB0 | regist;
	reset[1] = reply[1];
	reset[2] = reply[2];
	HAL_Delay(10);

	HAL_I2C_Master_Transmit(&hi2c1, SLAVE_ADDRESS_DHT20, (uint8_t*) reset, 3, 0xFF);
}

void dht20_start(void){

	uint8_t status[1];
	HAL_I2C_Master_Receive(&hi2c1, SLAVE_ADDRESS_DHT20 | 0x01, (uint8_t*) status, 1, 0xFF);

	if((status[0] & 0x18) != 0x18){
		dht20_reset(0x1B);
		dht20_reset(0x1C);
		dht20_reset(0x1E);
		HAL_GPIO_WritePin(GPIOA, GPIO_PIN_1, RESET);
	}

	if ((status[0] & 0x18) == 0x18){
		HAL_GPIO_WritePin(GPIOA, GPIO_PIN_1, SET);
	}

	uint8_t data[3] = {0xAC, 0x33, 0x00};


	HAL_I2C_Master_Transmit(&hi2c1, SLAVE_ADDRESS_DHT20, (uint8_t*) data, 3, 0xFF);
	HAL_Delay(80);
}

void dht20_read(uint16_t* value){
	dht20_start();
	uint8_t data[7];
	uint32_t Temper = 0, Humid = 0;
	HAL_I2C_Master_Receive(&hi2c1, SLAVE_ADDRESS_DHT20 | 0x01, (uint8_t*) data, 7, 0xFF);

	//Humid
	Humid = (Humid | data[1]) << 8;
	Humid = (Humid | data[2]) << 8;
	Humid = Humid | data[3];
	Humid = Humid >> 4;
    Humid = (Humid * 100 * 10 / 1024 / 1024);
    value[0] = Humid;


    Temper = (Temper | data[3]) << 8;
    Temper = (Temper | data[4]) << 8;
    Temper = Temper | data[5];
    Temper = Temper & 0xfffff;
    Temper = Temper*200*10/1024/1024 - 500;
	value[1] = Temper;

}

void init_reading(void){
	dht20_init();
	dht20_read(value_x10);
}
void get_dht20_values(uint16_t* temperature, uint16_t* humidity){
    *temperature = (float)(value_x10[1] / 10) + (float)(value_x10[1] % 10) / 10.0f;
    *humidity = (float)(value_x10[1] / 10) + (float)(value_x10[1] % 10) / 10.0f;
}


void reading_fsm_run(void){
	get_dht20_values(&T, &H);

	switch(status){
		case INIT:
			timerSet(1,1);
			status = READ;
			break;
		case READ:
			if (timerFlags[1] == 1){
				dht20_read(value_x10);
				//11011111 is degree character (manual)
				sprintf(temp, "TEMP:  %d.%d %cC  ",value_x10[1]/10,value_x10[1]%10 ,0b11011111);
				sprintf(humid, "Humid: %d.%d %% ", value_x10[0]/10, value_x10[0] % 10);
//				setTimer1(100);
			}
			break;
		default:
			break;
	}
	lcd_show_value();
}

void display_dht20_data(void){
	get_dht20_values(&T, &H);
	dht20_read(value_x10);
					//11011111 is degree character (manual)
	sprintf(temp, "TEMP:  %d.%d %cC  ",value_x10[1]/10,value_x10[1]%10 ,0b11011111);
	sprintf(humid, "Humid: %d.%d %% ", value_x10[0]/10, value_x10[0] % 10);
}
void notification_lights(void){
    get_dht20_values(&T, &H);
    if (T >= 30) {
        turnOn_RGB();
        if(T >= 33){
        	 HAL_GPIO_WritePin(FAN_GPIO_Port, FAN_Pin, GPIO_PIN_RESET);
        	 HAL_GPIO_WritePin(BLUZZER_GPIO_Port, BLUZZER_Pin, GPIO_PIN_RESET);
        }
    }

    else if (T < 20) {
        turnOn_RGB1();
    }
    else {
        turnOn_RGB2();
    }
}







