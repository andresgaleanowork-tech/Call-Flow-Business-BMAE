//go:build !windows

package main

// avisoNativo: en linux/mac el lanzador solo se usa para pruebas (binario gemelo
// vía CFB_HOME) → stderr ya es visible; no hay nada que hacer.
func avisoNativo(msg string) {}
