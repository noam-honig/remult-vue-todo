import { Allow, Entity, Fields, Validators } from "remult";

@Entity("tasks", {
    allowApiCrud: Allow.authenticated
})
export class Task {
    @Fields.uuid()
    id!: string;

    @Fields.string({
        validate: Validators.required
    })
    title = '';

    @Fields.boolean()
    completed = false;
}
