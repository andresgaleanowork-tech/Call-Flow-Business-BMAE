//go:build windows

package main

import (
	"syscall"
	"unsafe"
)

// v2.3.2 «Silencio» (bug CAZA#A1): con -H windowsgui el binario NO tiene consola
// y fmt.Fprintln(os.Stderr,…) no se veía en NINGÚN sitio → un fallo parecía
// «no pasa nada». MessageBoxW nativa vía user32.dll, sin dependencias externas.
func avisoNativo(msg string) {
	titulo, _ := syscall.UTF16PtrFromString("Call Flow Business — AVISO")
	texto, _ := syscall.UTF16PtrFromString(msg)
	user32 := syscall.NewLazyDLL("user32.dll")
	box := user32.NewProc("MessageBoxW")
	// MB_OK | MB_ICONERROR | MB_SYSTEMMODAL → se ve aunque otra ventana tape la app
	box.Call(0, uintptr(unsafe.Pointer(texto)), uintptr(unsafe.Pointer(titulo)), 0x0|0x10|0x1000)
}
