CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`whatsapp` varchar(20) NOT NULL,
	`city` varchar(100) NOT NULL,
	`interest` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
