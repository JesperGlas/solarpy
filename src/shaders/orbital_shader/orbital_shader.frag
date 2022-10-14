uniform vec3 u_ambientColor;
uniform vec3 u_lightColor;
uniform vec3 u_lightDirection;
uniform vec3 u_viewPosition;
uniform float u_specularStrength;
uniform float u_shininess;

vec3 lightCalc(int type, vec3 color, vec3 direction, vec3 point_position, vec3 point_normal)
{
    float ambient = 0;
    float diffuse = 0;
    float specular = 0;
    float attenuation = 1;
    vec3 light_direction = vec3(0, 0, 0);
    
    if (type == 1)  // ambient light
    {
        ambient = 1;
    }
    else if (type == 2)  // directional light
    {
        light_direction = normalize(direction);
    }
    if (type > 1)  // directional
    {
        point_normal = normalize(point_normal);
        diffuse = max(dot(point_normal, -light_direction), 0.0);
        diffuse *= attenuation;
        if (diffuse > 0)
        {
            vec3 view_direction = normalize(u_viewPosition - point_position);
            vec3 reflect_direction = reflect(light_direction, point_normal);
            specular = max(dot(view_direction, reflect_direction), 0.0);
            specular = u_specularStrength * pow(specular, u_shininess);
        }
    }
    return color * (ambient + diffuse + specular);
}

uniform bool u_useShadows;
uniform vec3 u_sunPosition;
uniform float u_sunRadius;
uniform vec3 u_moonPosition;
uniform float u_moonRadius;

float softShadow(vec3 light_pos, float light_radius, vec3 occluder_pos, float occluder_radius, vec3 fragment)
{
    vec3 v0 = light_pos - fragment;
    vec3 v1 = occluder_pos - fragment;

    float r0 = length(v0);
    float r1 = length(v1);

    float a0 = light_radius/r0;
    float a1 = occluder_radius/r1;

    float a = length( cross(v0, v1)/(r0*r1) );
    a = smoothstep(a0 - a1, a0 + a1, a);
    return 1 - (1-a) * pow(a1/a0, 2);
}

uniform vec3 u_color;
uniform bool u_useTexture;
uniform sampler2D u_texture;
uniform bool u_useBumpTexture;
uniform sampler2D u_bumpTexture;
uniform float u_bumpStrength;

in vec3 v_position;
in vec2 v_texCoords;
in vec3 v_normal;
out vec4 fragColor;

void main()
{
    vec4 color = vec4(u_color, 1.0);
    if (u_useTexture) 
    {
        color *= texture2D( u_texture, v_texCoords );
    }
    vec3 bump_normal = v_normal;
    if (u_useBumpTexture) 
    {
        bump_normal += u_bumpStrength * vec3(texture2D(u_bumpTexture, v_texCoords));
    }
    // Calculate total effect of lights on color
    vec3 light = vec3(0, 0, 0);

    // 1 = ambient light | 2 = directional light
    light += lightCalc( 1, u_ambientColor, u_lightDirection, v_position, bump_normal );
    light += lightCalc( 2, u_lightColor, u_lightDirection, v_position, bump_normal );

    if (u_useShadows)
        light *= softShadow(u_sunPosition, u_sunRadius, u_moonPosition, u_moonRadius, v_position);
    
    color *= vec4(light, 1); 
    
    fragColor = color;
}