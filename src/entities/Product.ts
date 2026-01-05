import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Company } from './Company';

@Entity("products")
export class Product {
    @PrimaryGeneratedColumn("uuid")
    id?: string;

    @Column({ type: 'uuid' })
    companyId?: string;

    @ManyToOne(() => Company, (company) => company.products)
    @JoinColumn({ name: 'companyId' })
    company?: Company;

    @Column()
    @IsNotEmpty()
    name?: string;

    @Column("decimal", { precision: 10, scale: 2 })
    @IsNumber()
    @Min(0)
    cost?: number;

    @Column()
    @IsNotEmpty()
    measuringUnit?: string;

    @Column("decimal", { precision: 5, scale: 2 })
    @IsNumber()
    @Min(0)
    ddvPercentage?: number;

    @CreateDateColumn()
    createdAt?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;
}
