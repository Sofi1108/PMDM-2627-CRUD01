import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Emisora } from "../emisora/entities/emisora.entity";
import { Programa } from "./entities/programa.entity";
import { ProgramaController } from "./programa.controller";
import { ProgramaService } from "./programa.service";

@Module({
  imports: [TypeOrmModule.forFeature([Emisora, Programa])],
  controllers: [ProgramaController],
  providers: [ProgramaService],
})
export class ProgramaModule {}