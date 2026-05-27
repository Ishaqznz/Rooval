export class CountDoctors {
  constructor(
    public search?: string,
    public status?: string
  ) { }

  public static create(
    search?: string,
    status?: string
  ): { ok: true, value: CountDoctors } | { ok: false, error: string } {

    const user = new CountDoctors(
      search,
      status
    )

    return { ok: true, value: user }
  }
}