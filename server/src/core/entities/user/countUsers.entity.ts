export class CountUsers {
  constructor(
    public search?: string,
    public status?: string
  ) { }

  public static create(
    search?: string,
    status?: string
  ): { ok: true, value: CountUsers } | { ok: false, error: string } {

    const user = new CountUsers(
      search,
      status
    )

    return { ok: true, value: user }
  }
}