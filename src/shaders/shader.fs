in vec3 vPosition;
in vec3 vNormal;

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
	speculareStrength = pow(speculareStrength, 32.0);
	vec3 specularLighting = speculareStrength * lightColor;

	// Lighting
	vec3 lighting = ambientLighting *0.5 + diffuseLighting*0.5 + specularLighting*1.0 ;

	vec3 modelColor = uColor; 
	vec3 color = modelColor * lighting;

	gl_FragColor = vec4(color, 1.0);
}