import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
} from 'typeorm';
import { IsNotEmpty, Length, IsBoolean, IsOptional } from 'class-validator';
import { Product } from './Product';

@Entity('companies')
export class Company {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'varchar', length: 255 })
    @IsNotEmpty()
    companyName: string;

    @Column({ type: 'varchar', length: 255 })
    @IsNotEmpty()
    street: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    @IsOptional()
    streetAdditional?: string;

    @Column({ type: 'varchar', length: 20 })
    @IsNotEmpty()
    postalCode: string;

    @Column({ type: 'varchar', length: 255 })
    @IsNotEmpty()
    city: string;

    @Column({ type: 'varchar', length: 34 })
    @IsNotEmpty()
    @Length(15, 34)
    iban: string;

    @Column({ type: 'varchar', length: 11 })
    @IsNotEmpty()
    @Length(8, 11)
    bic: string;

    @Column({ type: 'varchar', length: 20 })
    @IsNotEmpty()
    registrationNumber: string;

    @Column({ type: 'boolean', default: false })
    @IsOptional()
    @IsBoolean()
    vatPayer: boolean;

    @Column({ type: 'varchar', length: 20, nullable: true })
    @IsOptional()
    vatId?: string;

    @Column({ type: 'text', nullable: true })
    @IsOptional()
    additionalInfo?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    @IsOptional()
    documentLocation?: string;

    @Column({ type: 'boolean', default: false })
    @IsOptional()
    @IsBoolean()
    reverseCharge: boolean;

    @OneToMany(() => Product, (product) => product.company)
    products?: Product[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
