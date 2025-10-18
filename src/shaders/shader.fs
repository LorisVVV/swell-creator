// in
in vec3 vPosition;
in vec3 vNormal;
in vec3 vJacobianMatrix;
in float depth;

// Uniforms
uniform sampler2D uFoamTexture;
uniform vec3 uColor;

void main() {

	// Fresnel effect
	vec3 viewDirection = normalize(cameraPosition - vPosition);
	float fresnel = dot(viewDirection, vNormal);

	// Ambient light
	vec3 ambientLighting = vec3(0.5, 0.5, 0.5);

	// Diffuse light
	vec3 normal = normalize(vNormal);
	vec3 lightColor = vec3(1.0, 1.0, 1.0);
	vec3 lightCoord = vec3(0.5, 0.5, 0.5);
	float diffuseStrength = max(0.0, dot(lightCoord, normal));
	vec3 diffuseLighting = diffuseStrength * lightColor;

	// Specular light
	vec3 cameraSource = vec3(0.0, 0.0, 1.0);
	vec3 viewSource = normalize(cameraSource);
	vec3 reflectSource = normalize(reflect(-lightCoord, normal));
	float speculareStrength = max(0.0, dot(viewSource, reflectSource));
	speculareStrength = pow(speculareStrength, 64.0);
	vec3 specularLighting = speculareStrength * lightColor;

	// Lighting
	vec3 lighting = ambientLighting *0.5 + diffuseLighting*0.5 + specularLighting*0.5 ;

	// Foam
	float jacobianDeterminent = vJacobianMatrix.x * vJacobianMatrix.z - vJacobianMatrix.y * vJacobianMatrix.y;
	// vec3 foam = clamp(vec3(1.0)-jacobianDeterminent,0.0,1.0);
	// float foamTexture = ;

	// Depth
	vec3 colorShallow = vec3(72.0/255.0, 202.0/255.0, 228.0/255.0);
	vec3 amountOfColorShallow = colorShallow * depth *0.25;

	// Color
	vec3 modelColor = uColor + amountOfColorShallow; 
	vec3 color = modelColor * lighting;

	gl_FragColor = vec4(color, 0.9);
}