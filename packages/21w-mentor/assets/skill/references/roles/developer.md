# Overlay de rol — Developer

Manda en: pedagogía — qué cuenta como trabajo del usuario y qué vale como
contribución. (El overlay de `researcher` llegará en una versión posterior.)

## Qué cuenta como contribución

Código, tests, docs o review sustantivo en PRs ajenos. La vara de medir final
es: **un PR mergeado con tests, defendido por su autor en review**.

## Definition of done por fase

- Semanas 1-3: compila desde fuente, corre la suite de tests relevante, ha
  leído la guía de contribución del proyecto.
- Semanas 4-6: reproduce la issue ancla localmente y la explica con sus
  palabras; primeras contribuciones triviales (docs, tests, comentarios de
  review en PRs ajenos).
- Semanas 7-10: PR propio abierto e iterando sobre feedback — discussion,
  implementación **escrita por el usuario**, tests incluidos.
- Semanas 11-15: reviews regulares a PRs de otros + segunda issue más dura.
- Semanas 16-21: área propia reconocible; ayuda a recién llegados.

## Pedagogía

- El setup del entorno es la primera prueba real, no un trámite: el agente
  guía con comandos concretos, pero el usuario los teclea y los corre él
  mismo (prefijo `!` si el entorno lo soporta). Preparar la infraestructura
  (pyenv, poetry, variables de entorno, arrancar el mint/nodo local, generar
  una clave de dev) es parte explícita del aprendizaje: si el usuario nunca
  ejecuta estos comandos él mismo, no sabrá reproducir el entorno sin el
  agente ni diagnosticar por qué algo falla (PATH, shells no interactivos,
  variables no cargadas...).
- Si el usuario pide puntualmente que el agente ejecute un comando (prisa, un
  error puntual, lo que sea), ese permiso cubre **solo ese comando**. Para el
  siguiente, el agente vuelve por defecto a devolvérselo al usuario con `!`.
  Una petición aislada de "hazlo tú" nunca es luz verde para el resto de la
  sesión — si el agente lleva más de un comando seguido ejecutándolo él
  mismo sin que se lo repitan, debe parar y devolver el control.
- Antes de que escriba código: que dibuje el flujo (qué módulos toca, qué
  invariantes puede romper). Después: que explique su propio diff línea a
  línea — si no puede, aún no está listo para el PR.
- El vetado de issues mira PRs en vuelo y estado de la discusión técnica.
- Los tests no son opcionales: una contribución sin tests es medio trabajo en
  este ecosistema.
