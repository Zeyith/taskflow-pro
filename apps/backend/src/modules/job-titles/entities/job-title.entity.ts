export type CreateJobTitleProps = {
  id: string;
  code: string;
  label: string;
  createdAt: Date;
  updatedAt: Date;
};

export class JobTitle {
  readonly id: string;
  readonly code: string;
  readonly label: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: CreateJobTitleProps) {
    this.id = props.id;
    this.code = props.code;
    this.label = props.label;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
