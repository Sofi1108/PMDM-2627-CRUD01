import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Programa } from "./entities/programa.entity";
import { Emisora } from "../emisora/entities/emisora.entity";

@Injectable()
export class ProgramaService {
  constructor(
    @InjectRepository(Programa)
    private readonly programaRepository: Repository<Programa>,
    @InjectRepository(Emisora)
    private readonly emisoraRepository: Repository<Emisora>,
  ) {}

  async create(nombre: string, duracionMinutos: number, emisoraId: number) {
    const emisora = await this.emisoraRepository.findOneBy({ id: emisoraId });

    if (!emisora) {
      throw new NotFoundException(`No existe la emisora con id ${emisoraId}`);
    }

    const programa = this.programaRepository.create({
      nombre,
      duracionMinutos,
      emisora,
    });

    return this.programaRepository.save(programa);
  }
  
  async update(
    id: number,
    body: Partial<{
      nombre: string;
      duracionMinutos: number;
      emisora?: number;
      emisoraId?: number;
    }>,
  ) {
    const programa = await this.programaRepository.findOne({
      where: { id },
      relations: ["emisora"],
    });

    if (!programa) {
      throw new NotFoundException(`No existe el programa con id ${id}`);
    }

    if (body.nombre !== undefined) {
      programa.nombre = body.nombre;
    }

    if (body.duracionMinutos !== undefined) {
      programa.duracionMinutos = body.duracionMinutos;
    }

    const emisoraId = body.emisora ?? body.emisoraId;
    if (emisoraId !== undefined) {
      const emisora = await this.emisoraRepository.findOneBy({ id: emisoraId });

      if (!emisora) {
        throw new NotFoundException(`No existe la emisora con id ${emisoraId}`);
      }

      programa.emisora = emisora;
    }

    await this.programaRepository.save(programa);

    return this.programaRepository.findOne({
      where: { id },
      relations: ["emisora"],
    });
  }

  async delete(id: number) {
    const programa = await this.programaRepository.findOneBy({ id });
    if (!programa) {
      throw new NotFoundException(`No existe el programa con id ${id}`);
    }
    return this.programaRepository.remove(programa);
  }

  findAll() {
    return this.programaRepository
      .createQueryBuilder("registro")
      .innerJoinAndSelect("registro.emisora", "principal")
      .orderBy("registro.id", "ASC")
      .getMany();
  }

  findByEmisoraId(principalId: number) {
    return this.programaRepository
      .createQueryBuilder("registro")
      .innerJoinAndSelect("registro.emisora", "principal")
      .where("registro.id = :principalId", { principalId })
      .getOne();
  }

    searchByName(text: string) {
    return this.programaRepository
      .createQueryBuilder("registro")
      .innerJoinAndSelect("registro.emisora", "principal")
      .where("registro.nombre ILIKE :pattern", { pattern: `%${text}%` })
      .orderBy("registro.id", "ASC")
      .getMany();
  }

    searchByDuration(duracion: number) {
    return this.programaRepository
      .createQueryBuilder("registro")
      .innerJoinAndSelect("registro.emisora", "principal")
      .where("registro.duracionMinutos = :duracion", { duracion })
      .orderBy("registro.id", "ASC")
      .getMany();
  }

    findByEmisoraAndMinimum(principalId: number, minimum: number) {
    return this.programaRepository
      .createQueryBuilder("registro")
      .innerJoinAndSelect("registro.emisora", "principal")
      .where("principal.id = :principalId", { principalId })
      .andWhere("registro.duracionMinutos >= :minimum", { minimum })
      .orderBy("registro.duracionMinutos", "DESC")
      .getMany();
  }

    countByEmisora() {
    return this.emisoraRepository
      .createQueryBuilder("principal")
      .leftJoin("principal.programas", "registro")
      .select("principal.id", "id")
      .addSelect("principal.nombre", "nombre")
      .addSelect("COUNT(registro.id)", "total")
      .groupBy("principal.id")
      .addGroupBy("principal.nombre")
      .orderBy("principal.id", "ASC")
      .getRawMany();
  }
}