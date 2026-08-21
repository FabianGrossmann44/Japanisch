{ pkgs, config, ... }:

{
  # PHP - devenv nutzt automatisch die neueste PHP-Version aus nixpkgs
  # https://devenv.sh/languages/#php
  languages.php = {
    enable = true;

    # PHP-FPM Pool, den Caddy per FastCGI ansteuert
    fpm.pools.web.settings = {
      "pm" = "dynamic";
      "pm.max_children" = 5;
      "pm.start_servers" = 2;
      "pm.min_spare_servers" = 1;
      "pm.max_spare_servers" = 3;
    };
  };

  # MariaDB
  # https://devenv.sh/services/#mysql-mariadb
  services.mysql = {
    enable = true;
    package = pkgs.mariadb; # ist bereits der Standard, hier nur zur Klarheit gesetzt
  };

  # Caddy als Webserver, erreichbar über http://localhost:8080
  # https://devenv.sh/services/#caddy
  services.caddy = {
    enable = true;
    config = ''
      http://localhost:8080 {
        root * ${config.devenv.root}/public
        encode gzip
        php_fastcgi unix/${config.languages.php.fpm.pools.web.socket}
        file_server
      }
    '';
  };
  packages = [
    pkgs.dart-sass
  ];

  processes = {
    sass.exec = "sass --watch --style=expanded scss:public/css";
  };
}
