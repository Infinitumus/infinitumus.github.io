/*
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
}*/
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 v_texCoords;
uniform sampler2D u_texture;
uniform float u_time;

void main() {
    // Получаем базовый цвет текстуры
    vec4 texColor = texture2D(u_texture, v_texCoords);

    // Генерируем простой эффект снега
    float x = v_texCoords.x * u_time;
    float y = v_texCoords.y * u_time - u_time;
    float alpha = fract(sin(dot(vec2(x, y), vec2(12.9898, 78.233))) * 43758.5453);

    // Добавляем снег поверх текстуры
    if (alpha > 0.95) {
        texColor = mix(texColor, vec4(1.0, 1.0, 1.0, texColor.a), 0.3);
    }

    gl_FragColor = texColor;
}