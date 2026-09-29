package com.bm.callflow;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Call Flow Business — visor offline de guiones.
 * Los 5 HTML viajan embebidos (apk/assets); el progreso (localStorage)
 * persiste en los datos privados de la app. Sin permisos, sin internet.
 * v2.4 «Lógica»: cámara retirada junto al apartado QR (todo sincroniza por
 * usuario; la clave y el estado viven en el panel admin).
 */
public class MainActivity extends Activity {
    private WebView wv;

    @Override protected void onCreate(Bundle s) {
        super.onCreate(s);
        wv = new WebView(this);
        WebSettings st = wv.getSettings();
        st.setJavaScriptEnabled(true);     // la herramienta vive de JS
        st.setDomStorageEnabled(true);     // localStorage: KPIs, tutorial, variables
        st.setAllowFileAccess(true);       // navegación entre los HTML (enlaces relativos)
        st.setDatabaseEnabled(true);
        wv.setWebViewClient(new CfbClient());   // navegación interna (file:///android_asset/…) sigue dentro
        setContentView(wv);
        wv.loadUrl("file:///android_asset/index.html");
    }

    /** WebViewClient nombrado (d8 8.2.2 NPE con anónimas): web oficial, mailto y tel se abren FUERA de la app. */
    private static final class CfbClient extends WebViewClient {
        @Override public boolean shouldOverrideUrlLoading(WebView v, android.webkit.WebResourceRequest r) {
            String u = r.getUrl().toString();
            if (u.startsWith("http://") || u.startsWith("https://")
                    || u.startsWith("mailto:") || u.startsWith("tel:")) {
                try { v.getContext().startActivity(new android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(u))); } catch (Exception e) {}
                return true;
            }
            return false;
        }
    }

    @Override public void onBackPressed() {            // atrás = página anterior si la hay
        if (wv != null && wv.canGoBack()) wv.goBack();
        else super.onBackPressed();
    }

    @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); }
}
