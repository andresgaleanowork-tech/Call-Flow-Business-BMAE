// Call Flow Business · Lanzador offline para Windows
// ─────────────────────────────────────────────────────
//
//	1· extrae los 5 HTML embebidos a %LOCALAPPDATA%\Call Flow Business\
//	   (carpeta fija → el progreso localStorage persiste entre sesiones)
//
// 2· abre el menú en ventana NATIVA tipo app (Edge --app= / Chrome --app=),
//
//	sin pestañas ni barra de direcciones; si no hay ninguno, usa el
//	navegador predeterminado del sistema.
//
// Build Windows (desde Linux):
//
//	GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build \
//	  -ldflags="-H windowsgui -s -w" -o "dist/Call Flow Business.exe" .
package main

import (
	"embed"
	"fmt"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

//go:embed assets
var assets embed.FS

var files = []string{"index.html", "tutorial.html", "pymes.html", "residencial.html", "admin.html"}

func appDir() string {
	// override para tests (binario gemelo linux)
	if d := os.Getenv("CFB_HOME"); d != "" {
		return d
	}
	if runtime.GOOS == "windows" {
		if d := os.Getenv("LOCALAPPDATA"); d != "" {
			return filepath.Join(d, "Call Flow Business")
		}
		home, _ := os.UserHomeDir()
		return filepath.Join(home, "AppData", "Local", "Call Flow Business")
	}
	home, _ := os.UserHomeDir()
	return filepath.Join(home, ".local", "share", "call-flow-business")
}

func fileURL(path string) string {
	p := strings.ReplaceAll(path, "\\", "/")
	return (&url.URL{Scheme: "file", Path: p}).String()
}

// perfil tipo app: ventana sin UI del navegador
func browserCandidates() []string {
	pf := os.Getenv("ProgramFiles")
	pf86 := os.Getenv("ProgramFiles(x86)")
	lapp := os.Getenv("LOCALAPPDATA")
	var c []string
	if runtime.GOOS == "windows" {
		// Edge viene con Windows; Chrome opcional. Ambos soportan --app=
		for _, base := range []string{pf86, pf, lapp} {
			if base != "" {
				c = append(c, filepath.Join(base, "Microsoft", "Edge", "Application", "msedge.exe"))
			}
		}
		for _, base := range []string{pf, pf86, lapp} {
			if base != "" {
				c = append(c, filepath.Join(base, "Google", "Chrome", "Application", "chrome.exe"))
			}
		}
	} else {
		// modo test en linux: simulamos via CFB_TEST_OPENER, o xdg-open
		if t := os.Getenv("CFB_TEST_OPENER"); t != "" {
			c = append(c, t)
		} else {
			c = append(c, "xdg-open")
		}
	}
	return c
}

func launch(u string) string {
	if runtime.GOOS == "windows" {
		for _, bin := range browserCandidates() {
			if _, err := os.Stat(bin); err != nil {
				continue
			}
			cmd := exec.Command(bin, "--app="+u, "--new-window", "--window-size=1360,900")
			if err := cmd.Start(); err == nil {
				return bin
			}
		}
		// último recurso: navegador predeterminado del sistema
		exec.Command("rundll32", "url.dll,FileProtocolHandler", u).Start()
		return "predeterminado (rundll32)"
	}
	// linux/test
	for _, cmdline := range browserCandidates() {
		parts := strings.Fields(cmdline)
		args := parts[1:]
		if os.Getenv("CFB_TEST_OPENER") != "" {
			args = append(args, "--app="+u)
		} else {
			args = append(args, u)
		}
		if err := exec.Command(parts[0], args...).Run(); err == nil {
			return parts[0]
		}
	}
	return ""
}

func main() {
	dir := appDir()
	if err := os.MkdirAll(dir, 0755); err != nil {
		exit("No pude crear la carpeta de trabajo: " + err.Error())
	}
	for _, f := range files {
		data, err := assets.ReadFile("assets/" + f)
		if err != nil {
			exit("Recurso interno ausente: " + f)
		}
		dst := filepath.Join(dir, f)
		if err := os.WriteFile(dst, data, 0644); err != nil {
			exit("No pude escribir " + f + ": " + err.Error())
		}
	}
	u := fileURL(filepath.Join(dir, "index.html"))
	ab := launch(u)
	if ab == "" {
		exit("No encontré ningún navegador para abrir la herramienta.\n\nÁbrela a mano en tu navegador con esta ruta:\n" + u)
	}
	fmt.Printf("Call Flow Business ✔ abierto con: %s\n%s\n", ab, u)
}

func exit(msg string) {
	fmt.Fprintln(os.Stderr, "Call Flow Business — AVISO:", msg)
	avisoNativo(msg) // v2.3.2 «Silencio» (CAZA#A1): con -H windowsgui stderr es invisible → MessageBox nativa
	os.Exit(1)
}
