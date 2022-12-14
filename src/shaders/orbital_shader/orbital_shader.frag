struct Light
{
    vec3 ambient;
    vec3 color;
    vec3 position;
    float radius;
};

// light uniforms
uniform Light u_light;
uniform vec3 u_viewPosition;
uniform vec3 u_objectPosition;

// specular uniforms
uniform bool u_useSpecularTexture;
uniform sampler2D u_specularTexture;

// color uniforms
uniform vec3 u_color;
uniform bool u_useTexture;
uniform sampler2D u_texture;

// height uniforms
uniform bool u_useBumpTexture;
uniform sampler2D u_bumpTexture;
uniform float u_bumpStrength;

// atmosphere uniforms
uniform bool u_useAtmosphere;
uniform sampler2D u_atmosphereTexture;
uniform float u_time;

// night uniforms
uniform bool u_useNightTexture;
uniform sampler2D u_nightTexture;

// vertex shader data
in vec3 v_position;
in vec2 v_texCoords;
in vec3 v_normal;
in float v_radius;

// out data
out vec4 fragColor;

void main()
{
    // calculate light
    vec3 bump_normal = v_normal;
    if (u_useBumpTexture) 
    {
        bump_normal += u_bumpStrength * vec3(texture2D(u_bumpTexture, v_texCoords));
    }
    // calculate total effect of lights on color
    vec3 L = normalize(u_light.position - u_objectPosition);
    vec3 N = normalize(bump_normal);
    vec3 V = normalize(u_viewPosition - v_position);
    vec3 R = reflect(-L, N);

    // ambient
    vec3 ambient = u_light.ambient;
    
    // diffuse
    float diffuse = max( dot(N, L), 0.0 );

    // specular (TODO)
    float specular = 0.0;
    if (u_useSpecularTexture)
    {
        float specular_strength = 0.5;
        specular = pow( max( dot(V, R), 0.0 ), 32 ) * specular_strength;
        specular *= texture2D( u_specularTexture, v_texCoords ).r;
    }

    vec3 light = u_light.color * (ambient + diffuse + specular);

    // calculate color
    vec4 color = vec4(u_color, 1.0);
    if (u_useTexture) 
    {
        color *= texture2D( u_texture, v_texCoords );
    }
    if (u_useNightTexture)
    {
        float dark = 1-max(dot(L, N), 0.0);
        color = mix(color, texture2D( u_nightTexture, v_texCoords ), dark);
        
        // increase ambient to compensate for dark night texture
        vec3 ambient_increase = vec3(0.2);
        light += ambient_increase;
    }
    if (u_useAtmosphere)
    {
        // todo: Add cloud movements
        color += vec4(texture2D(u_atmosphereTexture, v_texCoords).rgb, 0.4);
    }

    fragColor = color * vec4(light, 1);
}