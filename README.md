# Wiki: Prototipo Funcional de HowlX

## Generación del Transcript

- **Carga de archivos de audio:**  
  Los usuarios pueden subir archivos de audio directamente al sistema mediante una interfaz intuitiva.

- **Transcripción automática:**  
  Una vez cargado el audio, se genera automáticamente un transcript del audio a texto usando WhisperAI, proporcionando alta precisión y soporte multilingüe.

## Generación del Reporte

- **Conexión con Inteligencia Artificial Generativa (Local):**  
  Se realiza una conexión local mediante LM Studio a un modelo de IA generativa que analiza el transcript.

- **Generación de Resúmenes:**  
  La IA genera un resumen claro y conciso del transcript, destacando los puntos clave de la llamada.

## Análisis de Sentimiento

- **Integración con Oracle Cloud Infrastructure (OCI):**  
  El transcript generado es enviado a OCI para un análisis avanzado de sentimiento.

- **Reporte de Sentimientos:**  
  OCI proporciona insights sobre el tono emocional de la llamada (positivo, negativo o neutral), ayudando a identificar posibles problemas de comunicación o satisfacción del cliente.

## AI Chatbot con Contexto

- **Conexión con IA generativa local:**  
  Se implementa un chatbot impulsado por un modelo generativo alojado localmente en LM Studio.

- **Contexto de interacción:**  
  Al interactuar con el chatbot, se incluye automáticamente como contexto tanto el transcript completo como el resumen y análisis de sentimiento generado previamente, permitiendo conversaciones informadas y contextualmente relevantes.

## Problemas que Soluciona

- **Reduce Miscomunicaciones:**  
  Al automatizar la transcripción y análisis, se minimiza la posibilidad de errores humanos en la interpretación de las llamadas.

- **Mejora de Eficiencia:**  
  La generación automática de transcripts y reportes permite a los usuarios enfocarse en tareas más importantes y estratégicas.

- **Insights Avanzados:**  
  Utilizando la inteligencia artificial, se pueden identificar tendencias, patrones emocionales y áreas de mejora en las interacciones telefónicas, mejorando así la calidad de servicio.

## Aplicación de Inteligencia Artificial

En este prototipo, aplicamos la inteligencia artificial de las siguientes maneras:

- **WhisperAI:**  
  Utilizado para convertir automáticamente audio a texto, ofreciendo transcripciones precisas y rápidas.

- **LM Studio (Modelos locales de IA generativa):**  
  Empleado para generar resúmenes automáticos y mantener conversaciones contextuales con usuarios a través del chatbot.

- **Oracle Cloud Infrastructure:**  
  Proporciona un análisis de sentimientos avanzado que complementa los reportes generados, entregando insights sobre la percepción emocional y satisfacción del cliente.

## Imágenes de Funcionamiento

![Image of file upload, event stream, report and summary](/assets/p1.png)  
![Image of transcript](assets/p2.png)  
![Image of AI Chatbot](assets/p3.png)


## Main Repo:
- https://github.com/SantiagoDlrr/howl

