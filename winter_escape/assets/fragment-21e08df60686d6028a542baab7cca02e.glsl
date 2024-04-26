#ifdef GL_ES
precision highp float;
#endif

varying vec2 v_texCoords;
uniform sampler2D u_texture;
uniform float u_time;

void main() {
    // Получаем базовый цвет текстуры
    vec4 texColor = texture2D(u_texture, v_texCoords);

    // Генерируем случайные координаты для снега
    float randomValue = fract(sin(dot(v_texCoords.xy ,vec2(12.9898,78.233))) * 43758.5453 + u_time);

    // Добавляем снег поверх текстуры
    if (randomValue > 0.9899) { // Увеличиваем порог для уменьшения количества снега
        texColor = mix(texColor, vec4(1.0), 0.5); // Можно также уменьшить интенсивность снега
    }

    gl_FragColor = texColor;
}