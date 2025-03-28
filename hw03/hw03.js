import { resizeAspectRatio, setupText, updateText, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

// Global variables
let isInitialized = false; // global variable로 event listener가 등록되었는지 확인
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let vao;
let positionBuffer;
let isDrawing = false;
let startPoint = null;
let tempEndPoint = null;
let order = 1;
const theta = Math.PI/50;
let r; 
let circleCenter = []; // 원 중심점
let tempCircle = []; // 임시 원
let circle = []; // 원
let lines = [];
let intersection = [];
let textOverlay;
let textOverlay2;
let textOverlay3;
let axes = new Axes(gl, 0.85);

// mouse 쓸 때 main call 방법
document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) {
        console.log("Already initialized");
        return;
    }

    main().then(success => { // call main function
        if (!success) {
            console.log('프로그램을 종료합니다.');
            return;
        }
        isInitialized = true;
    }).catch(error => {
        console.error('프로그램 실행 중 오류 발생:', error);
    });
});

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.7, 0.8, 0.9, 1.0);
    
    return true;
}

function setupCanvas() {
    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.2, 0.3, 1.0);
}

function setupBuffers(shader) {
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    shader.setAttribPointer('a_position', 2, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
}

function convertToWebGLCoordinates(x, y) {
    return [
        (x / canvas.width) * 2 - 1,
        -((y / canvas.height) * 2 - 1)
    ];
}

function setupMouseEvents() {
    function handleMouseDown(event) {
        event.preventDefault(); // 존재할 수 있는 기본 동작을 방지
        event.stopPropagation(); // event가 상위 요소로 전파되지 않도록 방지

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (!isDrawing) { // 그리고 있는 도중이 아닌 경우 
             // 캔버스 좌표를 WebGL 좌표로 변환하여 선분의 시작점을 설정
             let [glX, glY] = convertToWebGLCoordinates(x, y);
             startPoint = [glX, glY];
             circleCenter.push(...startPoint);
             isDrawing = true; // 이제 mouse button을 놓을 때까지 계속 true로 둠. 
        }
    }

    function handleMouseMove(event) {
        if (isDrawing) { // 원 혹은 선분을 그리고 있는 도중인 경우
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            let [glX, glY] = convertToWebGLCoordinates(x, y);
            tempEndPoint = [glX, glY];
            render();
        }
    }

    function handleMouseUp() {
        if (isDrawing && tempEndPoint) {
            if (order == 1) {
                addCircle(false);
                r = Math.sqrt((tempEndPoint[0]-startPoint[0])**2 + (tempEndPoint[1]-startPoint[1])**2);
                updateText(textOverlay, "Circle: center (" + circleCenter[0].toFixed(2) + ", " + circleCenter[1].toFixed(2) + 
                    ") radius = " + r.toFixed(2));
            } else if (order == 2) {
                lines.push([...startPoint, ...tempEndPoint]); 
                updateText(textOverlay2, "Line segment: (" + lines[0][0].toFixed(2) + ", " + lines[0][1].toFixed(2) + 
                    ") ~ (" + lines[0][2].toFixed(2) + ", " + lines[0][3].toFixed(2) + ")");
                findIntersection();
                if (intersection.length == 0) {
                    updateText(textOverlay3, "No Intersection");
                } else if (intersection.length == 1) {
                    updateText(textOverlay3, "Intersection Points: 1 Point 1: (" + intersection[0][0].toFixed(2) + ", " + intersection[0][1].toFixed(2) + ")");
                } else {
                    updateText(textOverlay3, "Intersection Points: 2 Point 1: (" + intersection[0][0].toFixed(2) + ", " + intersection[0][1].toFixed(2) + ") Point 2: (" +
                        intersection[1][0].toFixed(2) + ", " + intersection[1][1].toFixed(2) + ")");
                }
            }
            isDrawing = false;
            startPoint = null;
            tempEndPoint = null;
            render();
            order++;
        }
    }

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
}

function findIntersection() {
    let x1 = lines[0][0], y1 = lines[0][1], x2 = lines[0][2], y2 = lines[0][3];
    let e = circleCenter[0], f = circleCenter[1];
    let a = x2 - x1, b = x1, c = y2 - y1, d = y1;
    let A = a**2 + c**2;
    let B = 2*(a*b + c*d - a*e - c*f);
    let C = b**2 + d**2 + e**2 + f**2 - r**2 - 2*(b*e + d*f);
    let det = B**2 - 4*A*C;
    if (det < 0) return;
    let sqrtDet = Math.sqrt(det);
    let t1 = (-B + sqrtDet)/(2*A);
    let t2 = (-B - sqrtDet)/(2*A);
    if (t1===t2) {
        if (0<=t1 && t1<=1) {
            intersection.push([a*t1+b, c*t1+d]);
        }
    } else {
        if (0<=t1 && t1<=1) {
            intersection.push([a*t1+b, c*t1+d]);
        }
        if (0<=t2 && t2<=1) {
            intersection.push([a*t2+b, c*t2+d]);
        }
    }
}

function addCircle(temp) {
    let cen_x = circleCenter[0], cen_y = circleCenter[1];
    tempCircle = [];
    let arr = temp ? tempCircle : circle;
    for (let i=0; i<100; i++) {
        let new_x = cen_x + r * Math.cos(i*theta);
        let new_y = cen_y + r * Math.sin(i*theta);
        arr.push(new_x, new_y);
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    shader.use();
    
    // 저장된 선들 그리기
    for (let line of lines) {
        shader.setVec4("u_color", [1.0, 1.0, 1.0, 1.0]); // 선분의 color는 white
        shader.setInt("u_mode", 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(line), gl.STATIC_DRAW);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.LINES, 0, 2);
    }

    // 임시 선 그리기
    if (isDrawing && startPoint && tempEndPoint && order == 2) {
        shader.setVec4("u_color", [0.5, 0.5, 0.5, 1.0]); // 임시 선분의 color는 회색
        shader.setInt("u_mode", 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([...startPoint, ...tempEndPoint]), 
                      gl.STATIC_DRAW);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.LINES, 0, 2);
    }

    // 저장된 원 그리기
    if (circle.length > 0) {
        shader.setVec4("u_color", [1.0, 0.0, 1.0, 1.0]); // 원의 color는 purple
        shader.setInt("u_mode", 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circle), gl.STATIC_DRAW);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.LINE_LOOP, 0, 100);
    }

    // 임시 원 그리기
    if (isDrawing && startPoint && tempEndPoint && order == 1) {
        shader.setVec4("u_color", [0.5, 0.5, 0.5, 1.0]); // 임시 선분의 color는 회색
        shader.setInt("u_mode", 0);
        r = Math.sqrt((tempEndPoint[0]-startPoint[0])**2 + (tempEndPoint[1]-startPoint[1])**2);
        addCircle(true);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([...tempCircle]), gl.STATIC_DRAW);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.LINE_LOOP, 0, 100);
    }

    // 접점 그리기
    for (let dot of intersection) {
        shader.setVec4("u_color", [1.0, 1.0, 0.0, 1.0]); // 접점의 color는 yellow
        shader.setInt("u_mode", 1);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dot), gl.STATIC_DRAW);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.POINTS, 0, 1);
    }

    // axes 그리기
    axes.draw(mat4.create(), mat4.create());
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error('WebGL 초기화 실패');
        }

        // 셰이더 초기화
        shader = await initShader();
        
        // 나머지 초기화
        setupCanvas();
        setupBuffers(shader);
        shader.use();

        // 텍스트 초기화
        textOverlay = setupText(canvas, "", 1);
        textOverlay2 = setupText(canvas, "", 2);
        textOverlay3 = setupText(canvas, "", 3);
        
        // 마우스 이벤트 설정
        setupMouseEvents();

        // 창 크기 조정 시 렌더 함수 다시 호출
        window.addEventListener('resize', () => {
            render();
        });
        
        // 초기 렌더링
        render();

        return true;
    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}