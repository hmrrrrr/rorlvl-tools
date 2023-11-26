#### binary format docs (16bit ints are in little endian)

### header documentation
| address     | type   | description                   |
| :---------- | :----- | :---------------------------- |
| 0x0  - 0x11 | string | constant "rorlvl 0.2.0"       |
| 0x12 - 0x13 | int16  | camera left boundary          |
| 0x14 - 0x15 | int16  | camera top boundary           |
| 0x16 - 0x17 | int16  | camera right boundary         |
| 0x18 - 0x19 | int16  | camera bottom boundary        |
| 0x1a - 0x1b | uint16 | layer count                   |
| 0x21 - 0x23 | hex    | background color (sometimes?) |
| 0x25 -      | string | first layer                   |

### layer documentation
(assumes all strings are of length 1)
| address          | type   | description  |
| :----------------| :----- | :----------- |
| 0x00 - 0x00      | string | layer name   |
| 0x02 - 0x02      | string | tileset name |
| 0x04 - 0x05      | ???    | unknown      |
| 0x06 - 0x07      | uint16 | tile count   |
| 0x10 - 0x10+6*tc | n/a    | tile data    |

### tile documentation
| address   | type  | description     |
| :-------- | :---- | :-------------- |
| 0x00      | uint8 | texture atlas x |
| 0x01      | uint8 | texture atlas y |
| 0x02-0x03 | int16 | tile x pos      |
| 0x04-0x05 | int16 | tile y pos      |
