import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique, Index, OneToMany, ManyToOne, PrimaryColumn } from "typeorm"
import { Bookmark } from "./Bookmark"
@Entity()
export class User {

    @PrimaryGeneratedColumn('increment')
    id: number

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @Column({unique: true})
    email: string

    @Column()
    hash: string

    @Column({nullable: true})
    firstName: string

    @Column({nullable: true})
    lastName: string

    @OneToMany(() => Bookmark, (bookmark) => bookmark.userId, {
        onDelete: "CASCADE"
    })
    bookmarks: Bookmark[]

}
