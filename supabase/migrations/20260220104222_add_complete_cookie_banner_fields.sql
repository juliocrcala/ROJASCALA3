/*
  # Agregar campos completos para el banner de cookies

  1. Campos Nuevos en site_settings
    - `cookie_details_button_text`: Texto del botón "Ver más detalles"
    - `cookie_hide_details_button_text`: Texto del botón "Ocultar detalles"
    - `cookie_usage_title`: Título de la sección "Uso de Cookies"
    - `cookie_usage_text`: Descripción del uso de cookies
    - `cookie_ip_title`: Título de "Propiedad Intelectual"
    - `cookie_ip_intro`: Introducción de propiedad intelectual
    - `cookie_ip_point_1`: Punto 1 de propiedad intelectual
    - `cookie_ip_point_2`: Punto 2 de propiedad intelectual
    - `cookie_ip_point_3`: Punto 3 de propiedad intelectual
    - `cookie_ip_point_4`: Punto 4 de propiedad intelectual
    - `cookie_ip_point_5`: Punto 5 de propiedad intelectual
    - `cookie_privacy_title`: Título de "Privacidad"
    - `cookie_privacy_text`: Texto de privacidad
    - `cookie_footer_text`: Texto al pie del banner

  2. Seguridad
    - Los campos son accesibles públicamente para lectura
    - Solo admin puede modificar
*/

-- Agregar nuevas columnas para todo el contenido del banner
DO $$
BEGIN
  -- Texto del botón para mostrar detalles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'cookie_details_button_text'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN cookie_details_button_text text DEFAULT 'Ver más detalles';
  END IF;

  -- Texto del botón para ocultar detalles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'cookie_hide_details_button_text'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN cookie_hide_details_button_text text DEFAULT 'Ocultar detalles';
  END IF;

  -- Título de sección "Uso de Cookies"
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'cookie_usage_title'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN cookie_usage_title text DEFAULT 'Uso de Cookies';
  END IF;

  -- Descripción de uso de cookies
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'cookie_usage_text'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN cookie_usage_text text DEFAULT 'Recopilamos datos anónimos sobre las páginas visitadas para mejorar nuestros contenidos.';
  END IF;

  -- Título "Propiedad Intelectual"
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'cookie_ip_title'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN cookie_ip_title text DEFAULT 'Propiedad Intelectual';
  END IF;

  -- Introducción de propiedad intelectual
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'cookie_ip_intro'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN cookie_ip_intro text DEFAULT 'Al usar este sitio, aceptas que:';
  END IF;

  -- Puntos de propiedad intelectual
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'cookie_ip_point_1'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN cookie_ip_point_1 text DEFAULT 'El contenido es propiedad de sus autores';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'cookie_ip_point_2'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN cookie_ip_point_2 text DEFAULT 'Los artículos están protegidos por derechos de autor';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'cookie_ip_point_3'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN cookie_ip_point_3 text DEFAULT 'Debe respetarse y citarse la autoría';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'cookie_ip_point_4'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN cookie_ip_point_4 text DEFAULT 'El uso comercial sin autorización está prohibido';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'cookie_ip_point_5'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN cookie_ip_point_5 text DEFAULT 'Puedes compartir enlaces, no copiar contenido';
  END IF;

  -- Título "Privacidad"
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'cookie_privacy_title'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN cookie_privacy_title text DEFAULT 'Privacidad';
  END IF;

  -- Texto de privacidad
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'cookie_privacy_text'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN cookie_privacy_text text DEFAULT 'No recopilamos datos personales identificables. Todo es anónimo.';
  END IF;

  -- Texto al pie del banner
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'cookie_footer_text'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN cookie_footer_text text DEFAULT 'Al aceptar, reconoces los términos de uso y derechos de autor.';
  END IF;
END $$;