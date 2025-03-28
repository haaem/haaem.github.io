#version 300 es

in vec2 a_position;
uniform int u_mode;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    if (u_mode == 1) {
        gl_PointSize = 10.0;
    } else {
        gl_PointSize = 1.0;
    }
} 