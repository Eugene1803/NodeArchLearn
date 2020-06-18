-- MySQL dump 10.16  Distrib 10.1.37-MariaDB, for Win32 (AMD64)
--
-- Host: localhost    Database: learning_db
-- ------------------------------------------------------
-- Server version	10.1.37-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `learning_db`
--

/*!40000 DROP DATABASE IF EXISTS `file_storage_db`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `file_storage_db` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `file_storage_db`;

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`login` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_bin',
	`password` CHAR(150) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`eMail` CHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`active` INT(11) NULL DEFAULT 0,
	`verificationKey` VARCHAR(150) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`id`)
)
COLLATE='utf8mb4_general_ci';

