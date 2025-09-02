<?php
/**
 * Plugin Name: My Angular Widget
 * Description: Embed an Angular component via shortcode.
 * Version: 1.0.2
 */

add_shortcode('ng_widget', function ($atts = []) {

  static $printed = false;
  if ($printed) return '';   // prevent a second instance
  $printed = true;

  $atts  = shortcode_atts(['count' => '3'], $atts);
  $count = esc_attr($atts['count']);

  $dir = plugin_dir_path(__FILE__) . 'assets/';
  $uri = plugin_dir_url(__FILE__) . 'assets/';

  // Find built files (handles hashed filenames)
  $main = ngw_find_one($dir, 'main*.js');
  $poly = ngw_find_one($dir, 'polyfills*.js');
  $zone = file_exists($dir.'zone.umd.min.js') ? 'zone.umd.min.js' : null;

  // Fail loudly if build files missing
  if (!$main) return '<!-- ng_widget: missing main*.js in assets -->';

  // Inline loader so it works even when the theme omits wp_head/wp_footer.
  $html  = '<wp-ng-widget count="'.$count.'"></wp-ng-widget>' . "\n";
  $html .= "<script>(function(){\n";
  $html .= " if(window.__ngwLoaded) return; window.__ngwLoaded=true;\n";
  if ($zone) {
    $html .= "var z=document.createElement('script'); z.src='{$uri}{$zone}?v=".filemtime($dir.$zone)."'; z.onload=loadModules; document.head.appendChild(z);\n";
    $html .= "function loadModules(){ loadPoly(); loadMain(); }\n";
  } else {
    $html .= "loadPoly(); loadMain();\n";
  }
  if ($poly) {
    $html .= "function loadPoly(){ var s=document.createElement('script'); s.type='module'; s.src='{$uri}".basename($poly)."?v=".filemtime($poly)."'; document.head.appendChild(s); }\n";
  } else {
    $html .= "function loadPoly(){}\n";
  }
  $html .= "function loadMain(){ var s=document.createElement('script'); s.type='module'; s.src='{$uri}".basename($main)."?v=".filemtime($main)."'; document.head.appendChild(s); }\n";
  $html .= "})();</script>\n";

  return $html;
});

function ngw_find_one(string $dir, string $pattern) {
  $m = glob($dir . $pattern);
  if (!$m) return null;
  usort($m, fn($a,$b) => filemtime($b) <=> filemtime($a));
  return $m[0];
}

