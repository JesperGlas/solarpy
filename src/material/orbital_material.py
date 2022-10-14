from typing import Dict
from OpenGL.GL import *
from core.fileUtils import FileUtils
from shaders.shaderUtils import ShaderUtils
from material.material import Material
from core.texture import Texture

class OrbitalMaterial(Material):

    def __init__(self,
        texture_name: str=None,
        bumpmap_name: str=None,
        custom_shader: str = None,
        use_shadows: bool=False,
        properties: Dict={}) -> None:

        texture = Texture(FileUtils.getAsset(texture_name))
        bump_texture = Texture(FileUtils.getAsset(bumpmap_name))

        if custom_shader == None:
            vert_code, frag_code = ShaderUtils.loadShaderCode("orbital_shader")
        else:
            vert_code, frag_code = ShaderUtils.loadShaderCode(custom_shader)

        super().__init__(vert_code, frag_code)
        
        # add base uniforms
        self.addUniform("vec3", "u_color", [1.0, 1.0, 1.0])

        # add light uniforms
        self.addUniform("vec3", "u_ambientColor", [0.4, 0.4, 0.4])
        self.addUniform("vec3", "u_lightColor", [0.6, 0.6, 0.6])
        self.addUniform("vec3", "u_lightDirection", [-1, 0, 0])
        self.addUniform("vec3", "u_viewPosition", [0, 0, 0])
        self.addUniform("float", "u_specularStrength", 1)
        self.addUniform("float", "u_shininess", 1)

        # add shadow uniforms
        self.addUniform("bool", "u_useShadows", 0)
        if use_shadows:
            self.addUniform("bool", "u_useShadows", True)
            self.addUniform("vec3", "u_sunPosition", [0, 0, 0])
            self.addUniform("vec3", "u_moonPosition", [0, 0, 0])
            self.addUniform("float", "u_sunRadius", 0)
            self.addUniform("float", "u_moonRadius", 0)

        self.addUniform("vec3", "u_sunPosition", [0, 0, 0])
        self.addUniform("float", "u_sunRadius", 1.0)
        self.addUniform("vec3", "u_moonPosition", [0, 0, 0])
        self.addUniform("float", "u_moonRadius", 1.0)

        # add texture uniforms
        self.addUniform("bool", "u_useTexture", 0)
        if texture == None:
            self.addUniform("bool", "u_useTexture", False)
        else:
            self.addUniform("bool", "u_useTexture", True)
            self.addUniform("sampler2D", "u_texture", [texture._TextureRef, 1])

        # add bumpmap uniforms
        if bump_texture == None:
            self.addUniform("bool", "u_useBumpTexture", False)
        else:
            self.addUniform("bool", "u_useBumpTexture", True)
            self.addUniform("sampler2D", "u_bumpTexture", [bump_texture._TextureRef, 2])
            self.addUniform("float", "u_bumpStrength", 1.0)

        self.locateUniforms()

        # render both sides?
        self._Settings["doubleSided"] = True
        # render triangles as wireframe?
        self._Settings["onlyWireFrame"] = False
        # line thickness for wireframe rendering
        self._Settings["lineWidth"] = 1

        self.setProperties( properties )

    def updateRenderSettings(self) -> None:

        if self._Settings["doubleSided"]:
            glDisable( GL_CULL_FACE )
        else:
            glEnable( GL_CULL_FACE )

        if self._Settings["onlyWireFrame"]:
            glPolygonMode( GL_FRONT_AND_BACK, GL_LINE )
        else:
            glPolygonMode( GL_FRONT_AND_BACK, GL_FILL )
        
        glLineWidth(self._Settings["lineWidth"])