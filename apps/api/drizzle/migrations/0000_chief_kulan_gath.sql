CREATE TABLE `MAP` (
	`Domain` text PRIMARY KEY NOT NULL,
	`Ip` text
);
--> statement-breakpoint
CREATE TABLE `USERS` (
	`Id` text PRIMARY KEY NOT NULL,
	`Name` text,
	`Email` text,
	`Password` text,
	`Salt` text,
	`CreatedAt` numeric,
	`UpdatedAt` numeric
);
