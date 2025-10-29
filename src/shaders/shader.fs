// in
in vec3 vPosition;
in vec3 vNormal;
in vec3 vJacobianMatrix;
in float vJacobianDeterminent;
in float vDepth;

// Uniforms
uniform sampler2D uFoamTexture;
uniform vec3 uColor;
uniform samplerCube uEnvironment;
uniform vec3 uLightCoord;
uniform vec3 uColorShallow;

void main() {

	// Fresnel effect
	vec3 viewDirection = normalize(cameraPosition - vPosition);
	float fresnel = dot(viewDirection, vNormal);

	// Ambient light
	vec3 ambientLighting = vec3(0.5, 0.5, 0.5);

	// Diffuse light
	vec3 normal = normalize(vNormal);
	vec3 lightColor = vec3(1.0, 1.0, 1.0);
	// vec3 lightCoord = vec3(0.5, 0.5, 0.5);
	float diffuseStrength = max(0.0, dot(uLightCoord, normal));
	vec3 diffuseLighting = diffuseStrength * lightColor;

	// Specular light
	vec3 cameraSource = vec3(0.0, 0.0, 1.0);
	vec3 viewSource = normalize(cameraSource);
	vec3 reflectSource = normalize(reflect(-uLightCoord, normal));
	float speculareStrength = max(0.0, dot(viewSource, reflectSource));
	speculareStrength = pow(speculareStrength, 64.0);
	vec3 specularLighting = speculareStrength * lightColor;

	// Lighting
	vec3 lighting = ambientLighting *0.5 + diffuseLighting*0.25 + specularLighting*0.25 ;

	// Foam
	vec2 textCoord = vPosition.xy - floor(vPosition.xy);
	float foamAmount = clamp(-vJacobianDeterminent,0.0,1.0);
	vec3 foamColor = texture(uFoamTexture, textCoord).rgb ;


	// Depth
	vec3 amountOfColorShallow = uColorShallow * vDepth / 4.0;
	// float newDepth = (depth + 1.0)/2.0;

	// Reflection
	vec3 reflectVector = reflect(cameraPosition - vPosition, normal);
	vec3 colorReflected = texture(uEnvironment, reflectVector).rgb;

	// Color
	// vec3 modelColor = mix(uColor, uColorShallow, newDepth ); 
	vec3 modelColor = uColor + amountOfColorShallow + vec3(1.0) * foamAmount; 

	// vec3 test = mix(modelColor, foamColor, foamAmount);

	vec3 color = mix(modelColor, colorReflected, 0.04) * lighting;

	// Modifying the actual color
	gl_FragColor = vec4(color, 0.95);
}