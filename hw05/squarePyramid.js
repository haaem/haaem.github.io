export class SquarePyramid {
    constructor(gl, options = {}) {
        this.gl = gl;
        
        // Creating VAO and buffers
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        // Initializing data
        this.vertices = new Float32Array([
            // front face  (v0,v1,v2)
            0.0, 0.5, 0.0,   -0.5, -0.5, 0.5,  0.5, -0.5, 0.5,
            // right face  (v0,v2,v3)
            0.0, 0.5, 0.0,   0.5, -0.5,  0.5,   0.5, -0.5, -0.5,
            // left face   (v0,v4,v1)
            0.0, 0.5, 0.0,  -0.5, -0.5, -0.5,  -0.5, -0.5, 0.5,
            // back face   (v0,v3,v4)
            0.0, 0.5, 0.0,  0.5, -0.5, -0.5,  -0.5, -0.5, -0.5,
            // bottom face half (v4,v3,v2)
            -0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5, -0.5,  0.5,  
            // bottom face half (v2,v1,v4)
            0.5, -0.5, 0.5,  -0.5, -0.5, 0.5,  -0.5, -0.5, -0.5,
        ]);

        // if color is provided, set all vertices' color to the given color
        if (options.color) {
            for (let i = 0; i < 24 * 4; i += 4) {
                this.colors[i] = options.color[0];
                this.colors[i+1] = options.color[1];
                this.colors[i+2] = options.color[2];
                this.colors[i+3] = options.color[3];
            }
        }
        else {
            this.colors = new Float32Array([
                // front face (v0,v1,v2) - red
                1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,
                // right face (v0,v2,v3) - yellow
                1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1,
                // left face (v0,v4,v1) - cyan
                0, 1, 1, 1,   0, 1, 1, 1,   0, 1, 1, 1,
                // back face (v0,v3,v4) - magenta
                1, 0, 1, 1,   1, 0, 1, 1,   1, 0, 1, 1,
                // bottom face (v4,v3,v2,v1) - blue
                0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1,
                0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1,
            ]);
        }

        this.indices = new Uint16Array([
            // front face
            0, 1, 2,    // v0-v1-v2
            // right face
            3, 4, 5,      // v0-v2-v3
            // left face
            6, 7, 8, // v0-v4-v1
            // back face
            9, 10, 11,  // v0-v3-v4
            // bottom face
            12, 13, 14, 15, 16, 17, // v4-v3-v2, v2-v1-v4
        ]);

        this.initBuffers();
    }

    initBuffers() {
        const gl = this.gl;

        // 버퍼 크기 계산
        const vSize = this.vertices.byteLength;
        const cSize = this.colors.byteLength;
        const totalSize = vSize + cSize;

        gl.bindVertexArray(this.vao);

        // VBO에 데이터 복사
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, totalSize, gl.STATIC_DRAW);  // totalSize만큼의 메모리 할당. 두 번째 인수로 실제 데이터가 있었다면 그 데이터가 들어감.
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.colors);

        // EBO에 인덱스 데이터 복사
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        // vertex attributes 설정
        // gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);  // position
        gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, vSize);  // color

        // vertex attributes 활성화
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);

        // 버퍼 바인딩 해제
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    draw(shader) {

        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, 18, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }

    delete() {
        const gl = this.gl;
        gl.deleteBuffer(this.vbo);
        gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }
}