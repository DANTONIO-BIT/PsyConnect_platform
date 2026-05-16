import net from "node:net"
import { execSync, spawn } from "node:child_process"

const PORT = 3000

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer()

    server.once("error", () => resolve(false))
    server.once("listening", () => {
      server.close(() => resolve(true))
    })

    server.listen(port, "0.0.0.0")
  })
}

function printPortUsage(port) {
  try {
    const output = execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN`, { stdio: "pipe" }).toString()
    if (output.trim()) {
      console.error(output.trim())
      return
    }
  } catch {
    // no-op: fallback message below
  }

  console.error(`No se pudo obtener el proceso automáticamente. Ejecuta: lsof -nP -iTCP:${port} -sTCP:LISTEN`)
}

async function run() {
  const available = await isPortAvailable(PORT)

  if (!available) {
    console.error(`\nError: el puerto ${PORT} está ocupado. No se iniciará en un puerto alternativo.\n`)
    console.error("Proceso que usa el puerto:")
    printPortUsage(PORT)
    console.error(`\nPara liberar el puerto ${PORT}:`)
    console.error(`1) Identifica el PID: lsof -nP -iTCP:${PORT} -sTCP:LISTEN`)
    console.error("2) Cierra el proceso: kill -15 <PID> (o kill -9 <PID> si no responde)")
    process.exit(1)
  }

  const next = spawn("next", ["dev", "--port", String(PORT)], {
    stdio: "inherit",
    shell: process.platform === "win32",
  })

  next.on("exit", (code) => process.exit(code ?? 0))
}

run()
