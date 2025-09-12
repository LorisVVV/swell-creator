
// Max number of waves
#define MAX_WAVES 32

varying vec3 vPosition;

uniform float uTime;

struct Wave {
	vec2 vecteurDirection;
	float waveNumber;
	float amplitude;
	float phase;
	float angularFrequency;
};

uniform Wave uWaves[MAX_WAVES];

uniform int uWavesListSize;


vec3 calculPosition(float alpha, float beta, Wave waves[MAX_WAVES], int listSize, float time) {

	float waveOffsetX = 0.0;

    float waveOffsetZ = 0.0;

    float waveOffsetY = 0.0;


	for(int i = 0; i < listSize; i++) {
		// mat3 currentwaveMatrix = waves[i];
		// Wave currentwave = Wave(vec2(currentwaveMatrix[0][0], currentwaveMatrix[1][0]), currentwaveMatrix[2][0], currentwaveMatrix[0][1], currentwaveMatrix[1][1], currentwaveMatrix[2][1] );


		Wave currentwave = waves[i];

		float om = currentwave.vecteurDirection.x * alpha + currentwave.vecteurDirection.y * beta - currentwave.angularFrequency * time - currentwave.phase;

		float currentWaveOffsetX = (currentwave.vecteurDirection.x / currentwave.waveNumber ) * currentwave.amplitude * sin(om);
		
		float currentWaveOffsetZ = (currentwave.vecteurDirection.y / currentwave.waveNumber ) * currentwave.amplitude * sin(om);
		
		float currentWaveOffsetY = currentwave.amplitude * cos(om);

		waveOffsetX += currentWaveOffsetX;

		waveOffsetZ += currentWaveOffsetZ;
		
		waveOffsetY += currentWaveOffsetY;
	}

	return vec3(alpha - waveOffsetX, beta - waveOffsetZ, waveOffsetY);
}

void main() {
	vPosition = position;
	vec3 newPosition;

	newPosition = calculPosition(vPosition.x, vPosition.y, uWaves, uWavesListSize, uTime);
	vPosition = newPosition;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition.xyz, 1.0 );
}