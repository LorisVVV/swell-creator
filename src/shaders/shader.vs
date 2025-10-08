
// Max number of waves
#define MAX_WAVES 32

out vec3 vPosition;
out vec3 vNormal;
out vec3 vDisplacement;
// out float vIsCrest;

uniform float uTime;

struct Wave {
	vec2 vecteurDirection;
	float waveNumber;
	float amplitude;
	float phase;
	float angularFrequency;
	float waveLength;
};

uniform Wave uWaves[MAX_WAVES];

uniform int uWavesListSize;

vec3 calculPosition(float alpha, float beta, Wave waves[MAX_WAVES], int listSize, float time) {

	float waveOffsetX = 0.0;

    float waveOffsetZ = 0.0;

    float waveOffsetY = 0.0;


	for(int i = 0; i < listSize; i++) {

		Wave currentwave = waves[i];

		// float om = currentwave.vecteurDirection.x * alpha * currentwave.waveLength + currentwave.vecteurDirection.y * beta * currentwave.waveLength  - currentwave.angularFrequency * time - currentwave.phase;

		// Real wave length
		float om = currentwave.vecteurDirection.x * alpha * (1.0/currentwave.waveLength) + currentwave.vecteurDirection.y * beta * (1.0/currentwave.waveLength)  - currentwave.angularFrequency * time - currentwave.phase;


		float currentWaveOffsetX = (currentwave.vecteurDirection.x / currentwave.waveNumber ) * currentwave.amplitude * sin(om);
		
		float currentWaveOffsetZ = (currentwave.vecteurDirection.y / currentwave.waveNumber ) * currentwave.amplitude * sin(om);
		
		float currentWaveOffsetY = currentwave.amplitude * cos(om);

		waveOffsetX += currentWaveOffsetX;

		waveOffsetZ += currentWaveOffsetZ;
		
		waveOffsetY += currentWaveOffsetY;


		// if (currentWaveOffsetY > currentwave.amplitude-0.0001) {
		// 	vIsCrest = 1.0;
		// }
	}

	return vec3(alpha - waveOffsetX, beta - waveOffsetZ, waveOffsetY);
}

vec3 getNormal(vec3 newPosition) {
	vec3 tangent = calculPosition(position.x+1.0, position.y, uWaves, uWavesListSize, uTime) - newPosition;
	vec3 bitangent = calculPosition(position.x, position.y+1.0, uWaves, uWavesListSize, uTime) - newPosition;

	return normalize(cross(tangent, bitangent));
}

void main() {

	//Calculate position
	vec3 newPosition;
	newPosition = calculPosition(position.x, position.y, uWaves, uWavesListSize, uTime);

	vDisplacement = position - newPosition;


	vec3 normal = getNormal(newPosition);

	vNormal = normal;

	vPosition = newPosition;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition.xyz, 1.0 );
}