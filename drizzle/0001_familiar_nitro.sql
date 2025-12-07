CREATE TABLE `alertEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertId` int NOT NULL,
	`websiteId` int NOT NULL,
	`metricValue` varchar(100) NOT NULL,
	`severity` varchar(20) NOT NULL,
	`isResolved` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `alertEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coreWebVitals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`lcp` int,
	`fid` int,
	`cls` varchar(50),
	`lighthouseScore` int,
	`performanceScore` int,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coreWebVitals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`websiteId` int NOT NULL,
	`frequency` varchar(50) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`lastSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailSubscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performanceAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`metricType` varchar(50) NOT NULL,
	`thresholdValue` varchar(50) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `performanceAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performanceReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`reportType` varchar(50) NOT NULL,
	`summary` text,
	`metrics` text,
	`recommendations` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `performanceReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `websites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`url` varchar(512) NOT NULL,
	`name` varchar(255) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `websites_id` PRIMARY KEY(`id`)
);
