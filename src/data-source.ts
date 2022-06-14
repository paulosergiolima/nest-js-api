import "reflect-metadata"
import { DataSource } from "typeorm"
import { Bookmark } from "./entity/Bookmark"
import { User } from "./entity/User"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5434,
    username: "postgres",
    password: "123",
    database: "nest",
    synchronize: true,
    logging: false,
    entities: [User, Bookmark],
    migrations: [],
    subscribers: [],
})
