CREATE DATABASE app_clickcrop;

USE app_clickcrop;

CREATE TABLE usuarios(  
    id INT(11) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(60) NOT NULL,
);

ALTER TABLE usuarios
    ADD PRIMARY KEY (id);

ALTER TABLE usuarios
    MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 1;

DESCRIBE usuarios;   

--SISRIS TABLE

CREATE TABLE sisris (
    id INT(11) NOT NULL,
    clavedemodelo VARCHAR(150) NOT NULL,
    user_id INT(11),
    created_at timestamp NOT NULL DEFAULT current_timestamp,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES usuarios(id)
);

ALTER TABLE sisris
ADD PRIMARY KEY (id);

ALTER TABLE sisris MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 1;

