export class OpenedFile {
  constructor(
    public filename: string,
    public used:     boolean,
    public strace:   boolean = true
  ) {}
}

export class ContainerData {
  constructor(
    public cmd: string,
  ) {}
}

export const generateDockerFile = (containerData: ContainerData, openedFiles: OpenedFile[]) => {
  return `FROM redis:7.2.2-bookworm AS build

    FROM scratch

    # Redis binaries, modules, configuration, log and runtime files
    COPY --from=build /usr/bin/${containerData.cmd} /usr/bin/${containerData.cmd}

    # Libraries
    ${ openedFiles
        .filter((openedFile) => { return openedFile.used })
        .map((openedFile) => {
      return `COPY --from=build ${openedFile.filename} ${openedFile.filename}`
    }).join("\n")}
  `

    //
    // # Custom configuration files, including using a single process for Redis
    // COPY ./redis.conf /etc/redis/redis.conf
}
