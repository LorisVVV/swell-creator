
// Max number of waves
#define MAX_WAVES 32
#define PI 3.1415926535

struct Wave {
	vec2 vecteurDirection;
	float waveNumber;
	float amplitude;
	float phase;
	float angularFrequency;
	float waveLength;
};

// Uniforms
uniform float uTime;
uniform Wave uWaves[MAX_WAVES];
uniform int uWavesListSize;
uniform int uNbBand;

// Out
out vec3 vPosition;
out vec3 vNormal;
out vec3 vJacobianMatrix;
out float depth;

void updateJacobianMatrix(Wave currentWave) {
	float W = (2.0*PI) / currentWave.waveLength;
	float speed = sqrt(9.8 * W);// Might not work as I divide the gravity
	float WA = W * currentWave.amplitude;
	float steepness = (currentWave.amplitude*2.0/currentWave.waveLength) / (WA * currentWave.waveNumber);
	float QA = steepness * currentWave.amplitude;
	float vertexDotDirection = dot(position.xy, currentWave.vecteurDirection);
	float rad = (W * vertexDotDirection) + (speed * currentWave.angularFrequency*uTime); 
	float sine = sin(rad);
	float cosine = cos(rad);

	float steepnessWASine = steepness * WA * sine;

	vJacobianMatrix += vec3 (
		-(steepnessWASine * currentWave.vecteurDirection.x *  currentWave.vecteurDirection.x),
		-(steepnessWASine * currentWave.vecteurDirection.x *  currentWave.vecteurDirection.y),
		-(steepnessWASine * currentWave.vecteurDirection.y *  currentWave.vecteurDirection.y)
	);
}

// Main function, return a maxtrix 2*3 with first column being the new position of the vertice
mat2x3 computePositionByBand(float alpha, float beta, Wave waves[MAX_WAVES], int listSize, float time) {

	//	Position initialisation
	vec3 newPosition = vec3(alpha, beta, 0.0);	

	// Tangent and Bitangent initialization for normal
	vec3 tangent = vec3(alpha+1.0, beta, 0.0);
	vec3 bitangent = vec3(alpha,beta+1.0, 0.0);

	// Iterator
	int bandSize = 1;
	int index = 0;

	for(int i = 0; i < uNbBand+1; i++) {

		// Initialization of the offsets for this band
		vec3 waveOffSet = vec3(0.0);
		vec3 waveOffSetTangent = vec3(0.0);
		vec3 waveOffSetBitangent = vec3(0.0);

		int j = index;
		int endOfBand = index + bandSize;
		while (j < endOfBand && j < listSize) {
			Wave currentwave = waves[j];

			// Real wave length

			// Offset of the actual position
			float om = currentwave.vecteurDirection.x * newPosition.x * (1.0/currentwave.waveLength) + currentwave.vecteurDirection.y * newPosition.y * (1.0/currentwave.waveLength)  - currentwave.angularFrequency * time - currentwave.phase;
			waveOffSet += vec3( 
				(currentwave.vecteurDirection.x / currentwave.waveNumber ) * currentwave.amplitude * sin(om),
				(currentwave.vecteurDirection.y / currentwave.waveNumber ) * currentwave.amplitude * sin(om),
				currentwave.amplitude * cos(om)
			);

			// Offset of the tangent
			float omTangent = currentwave.vecteurDirection.x * tangent.x * (1.0/currentwave.waveLength) + currentwave.vecteurDirection.y * tangent.y * (1.0/currentwave.waveLength)  - currentwave.angularFrequency * time - currentwave.phase;
			waveOffSetTangent += vec3(
				(currentwave.vecteurDirection.x / currentwave.waveNumber ) * currentwave.amplitude * sin(omTangent),
				(currentwave.vecteurDirection.y / currentwave.waveNumber ) * currentwave.amplitude * sin(omTangent),
				currentwave.amplitude * cos(omTangent)
			);

			// Offset of the bitangent
			float omBitangent = currentwave.vecteurDirection.x * bitangent.x * (1.0/currentwave.waveLength) + currentwave.vecteurDirection.y * bitangent.y * (1.0/currentwave.waveLength)  - currentwave.angularFrequency * time - currentwave.phase;
			waveOffSetBitangent += vec3(
				(currentwave.vecteurDirection.x / currentwave.waveNumber ) * currentwave.amplitude * sin(omBitangent),
				(currentwave.vecteurDirection.y / currentwave.waveNumber ) * currentwave.amplitude * sin(omBitangent),
				currentwave.amplitude * cos(omBitangent)
			);


			// Jacobian Matrix
			updateJacobianMatrix(currentwave);

			j++;
			index++;
		}

		newPosition = vec3(newPosition.x - waveOffSet.x, newPosition.y - waveOffSet.y, newPosition.z+waveOffSet.z);
		tangent = vec3(tangent.x - waveOffSetTangent.x, tangent.y - waveOffSetTangent.y, tangent.z+waveOffSetTangent.z);
		bitangent = vec3(bitangent.x - waveOffSetBitangent.x, bitangent.y - waveOffSetBitangent.y, bitangent.z+waveOffSetBitangent.z);
	
		bandSize = bandSize + 2;
	}
	tangent -= newPosition;
	bitangent -= newPosition;
	vec3 normal = normalize(cross(tangent, bitangent));
	return mat2x3(newPosition, normal);
}



void main() {

	vJacobianMatrix = vec3(0.0);

	mat2x3 positionAndNormal = computePositionByBand(position.x, position.y, uWaves, uWavesListSize, uTime);

	//Calculate position, normal and displacement;
	vec3 newPosition = positionAndNormal[0];
	vec3 normal = positionAndNormal[1];
	
	depth = (position.z + newPosition.z) / uWaves[0].amplitude;
	
	// vec3 displacement = position + newPosition;



	// Passing varying to fragment shader
	vNormal = normal;
	vPosition = newPosition;


	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition.xyz, 1.0 );
}