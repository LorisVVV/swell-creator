
in vec3 vPosition;

void main() {
	gl_FragColor = vec4( vPosition.zz, 1.0, 1.0 );
}