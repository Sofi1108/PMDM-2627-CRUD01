import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ProgramaService } from "./programa.service";

type CrearProgramaBody = {
  nombre: string;
  duracionMinutos: number;
  emisora?: number;
  emisoraId?: number;
};

@Controller("programas")
export class ProgramaController {
  constructor(private readonly programaService: ProgramaService) {}

  @Post()
  create(@Body() body: CrearProgramaBody | undefined) {
    if (!body) {
      throw new BadRequestException(
        "El cuerpo debe ser JSON con nombre, duracionMinutos y emisoraId",
      );
    }

    const emisoraId = body.emisora ?? body.emisoraId;

    if (!body.nombre || body.duracionMinutos === undefined || emisoraId === undefined) {
      throw new BadRequestException(
        "El cuerpo debe incluir nombre, duracionMinutos y emisora",
      );
    }

    return this.programaService.create(
      body.nombre,
      body.duracionMinutos,
      emisoraId,
    );
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() body: Partial<CrearProgramaBody>,
  ) {
    return this.programaService.update(Number(id), body);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.programaService.delete(Number(id));
  }

  @Get()
  findAll() {
    return this.programaService.findAll();
  }

  @Get("emisora/:principalId")
  findByEmisoraId(@Param("principalId") principalId: number) {
    return this.programaService.findByEmisoraId(Number(principalId));
  }
  @Get("programas")
  findPrograms() {
    return this.programaService.findAll();
  }

  @Get("buscar")
  searchByName(@Query("texto") text: string) {
    return this.programaService.searchByName(text);
  }

  @Get("emisora/:principalId/minimo/:minimum")
  findByEmisoraAndMinimum(
    @Param("principalId") principalId: string,
    @Param("minimum") minimum: string,
  ) {
    return this.programaService.findByEmisoraAndMinimum(Number(principalId), Number(minimum));
  }

  @Get("resumen/emisora")
  countByEmisora() {
    return this.programaService.countByEmisora();
  }

  @Get("duracion/:duracion")
  searchByDuration(@Param("duracion") duracion: string) {
    return this.programaService.searchByDuration(Number(duracion));
  }
}