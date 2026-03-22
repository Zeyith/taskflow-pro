export type CreateProjectProps = {
  id: string;
  name: string;
  description: string | null;
  createdBy: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export class Project {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly createdBy: string;
  readonly isArchived: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;

  constructor(props: CreateProjectProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.createdBy = props.createdBy;
    this.isArchived = props.isArchived;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  isActive(): boolean {
    return !this.isArchived && this.deletedAt === null;
  }
}
