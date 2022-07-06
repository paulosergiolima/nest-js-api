import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique, Index, ManyToOne } from "typeorm"
import {User} from "./User"
@Entity()
export class Bookmark {
    @PrimaryGeneratedColumn("increment")
    id: number

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updateAt: Date

    @Column()
    title: string

    @Column({nullable: true})
    description: string

    @Column()
    link: string

    @ManyToOne(() => User, (user) => user.bookmarks, {
        eager: true,
        onDelete: "CASCADE",
        cascade: true,
    })
    userId: User
}