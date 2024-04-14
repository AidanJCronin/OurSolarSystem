uniform sampler2D texture;
varying vec2 vUv;

void main() {
    vec2 pixelSize = vec2(0.05, 0.05); // Adjust the pixel size to control the pixelation effect
    vec2 roundedUV = floor(vUv / pixelSize) * pixelSize;
    vec4 color = texture2D(texture, roundedUV);
    gl_FragColor = color;
}