
local ffi = require("ffi")
local raylib = ffi.load("libraylib.so") -- or .dll/.dylib

local f = io.open("/mnt/chromeos/removable/card/apps_folder/programs/lua/lib/raylib_clean.h", "r")
local header = f:read("*a")
f:close()
ffi.cdef(header)

-- raylib.lua
local M = {}


M.raylib = raylib



-- Color
function M.Color(r,g,b,a)
    return {r = r or 0, g = g or 0, b = b or 0, a = a or 255}
end

-- assuming you already have:
-- function M.Color(r,g,b,a) return {r=r or 0,g=g or 0,b=b or 0,a=a or 255} end

-- Predefined Raylib Colors as constants
M.LIGHTGRAY   = M.Color(200, 200, 200, 255)
M.GRAY        = M.Color(130, 130, 130, 255)
M.DARKGRAY    = M.Color(80, 80, 80, 255)
M.YELLOW      = M.Color(253, 249, 0, 255)
M.GOLD        = M.Color(255, 203, 0, 255)
M.ORANGE      = M.Color(255, 161, 0, 255)
M.PINK        = M.Color(255, 109, 194, 255)
M.RED         = M.Color(230, 41, 55, 255)
M.MAROON      = M.Color(190, 33, 55, 255)
M.GREEN       = M.Color(0, 228, 48, 255)
M.LIME        = M.Color(0, 158, 47, 255)
M.DARKGREEN   = M.Color(0, 117, 44, 255)
M.SKYBLUE     = M.Color(102, 191, 255, 255)
M.BLUE        = M.Color(0, 121, 241, 255)
M.DARKBLUE    = M.Color(0, 82, 172, 255)
M.PURPLE      = M.Color(200, 122, 255, 255)
M.VIOLET      = M.Color(135, 60, 190, 255)
M.DARKPURPLE  = M.Color(112, 31, 126, 255)
M.BEIGE       = M.Color(211, 176, 131, 255)
M.BROWN       = M.Color(127, 106, 79, 255)
M.DARKBROWN   = M.Color(76, 63, 47, 255)
M.WHITE       = M.Color(255, 255, 255, 255)
M.BLACK       = M.Color(0, 0, 0, 255)
M.BLANK       = M.Color(0, 0, 0, 0)
M.MAGENTA     = M.Color(255, 0, 255, 255)
M.RAYWHITE    = M.Color(245, 245, 245, 255)



-- Basic Vector structs
function M.Vector2(x, y)
    return {x = x or 0, y = y or 0}
end

function M.Vector3(x, y, z)
    return {x = x or 0, y = y or 0, z = z or 0}
end

function M.Vector4(x, y, z, w)
    return {x = x or 0, y = y or 0, z = z or 0, w = w or 0}
end

-- Alias
M.Quaternion = M.Vector4

-- Matrix
function M.Matrix(m0,m4,m8,m12,m1,m5,m9,m13,m2,m6,m10,m14,m3,m7,m11,m15)
    return {
        m0=m0 or 0, m4=m4 or 0, m8=m8 or 0, m12=m12 or 0,
        m1=m1 or 0, m5=m5 or 0, m9=m9 or 0, m13=m13 or 0,
        m2=m2 or 0, m6=m6 or 0, m10=m10 or 0, m14=m14 or 0,
        m3=m3 or 0, m7=m7 or 0, m11=m11 or 0, m15=m15 or 0
    }
end


-- Rectangle
function M.Rectangle(x, y, width, height)
    return {x = x or 0, y = y or 0, width = width or 0, height = height or 0}
end

-- Image
function M.Image(data, width, height, mipmaps, format)
    return {data=data, width=width or 0, height=height or 0, mipmaps=mipmaps or 0, format=format or 0}
end

-- Texture
function M.Texture(id, width, height, mipmaps, format)
    return {id=id or 0, width=width or 0, height=height or 0, mipmaps=mipmaps or 0, format=format or 0}
end

-- RenderTexture
function M.RenderTexture(id, texture, depth)
    return {id=id or 0, texture=texture or M.Texture(), depth=depth or M.Texture()}
end

-- NPatchInfo
function M.NPatchInfo(source, left, top, right, bottom, layout)
    return {source=source or M.Rectangle(), left=left or 0, top=top or 0, right=right or 0, bottom=bottom or 0, layout=layout or 0}
end

-- GlyphInfo
function M.GlyphInfo(value, offsetX, offsetY, advanceX, image)
    return {value=value or 0, offsetX=offsetX or 0, offsetY=offsetY or 0, advanceX=advanceX or 0, image=image or M.Image()}
end

-- Font
function M.Font(baseSize, glyphCount, glyphPadding, texture, recs, glyphs)
    return {baseSize=baseSize or 0, glyphCount=glyphCount or 0, glyphPadding=glyphPadding or 0,
            texture=texture or M.Texture(), recs=recs or {}, glyphs=glyphs or {}}
end

-- Camera3D
function M.Camera3D(position, target, up, fovy, projection)
    return {position=position or M.Vector3(), target=target or M.Vector3(), up=up or M.Vector3(),
            fovy=fovy or 0, projection=projection or 0}
end
M.Camera = M.Camera3D

-- Camera2D
function M.Camera2D(offset, target, rotation, zoom)
    return {offset=offset or M.Vector2(), target=target or M.Vector2(), rotation=rotation or 0, zoom=zoom or 1}
end

-- Mesh
function M.Mesh(vertexCount, triangleCount, vertices, texcoords, texcoords2, normals, tangents, colors, indices,
                boneCount, boneIndices, boneWeights, animVertices, animNormals, vaoId, vboId)
    return {
        vertexCount=vertexCount or 0, triangleCount=triangleCount or 0,
        vertices=vertices or {}, texcoords=texcoords or {}, texcoords2=texcoords2 or {},
        normals=normals or {}, tangents=tangents or {}, colors=colors or {}, indices=indices or {},
        boneCount=boneCount or 0, boneIndices=boneIndices or {}, boneWeights=boneWeights or {},
        animVertices=animVertices or {}, animNormals=animNormals or {},
        vaoId=vaoId or 0, vboId=vboId or {}
    }
end

-- Shader
function M.Shader(id, locs)
    return {id=id or 0, locs=locs or {}}
end

-- MaterialMap
function M.MaterialMap(texture, color, value)
    return {texture=texture or M.Texture(), color=color or M.Color(), value=value or 0}
end

-- Material
function M.Material(shader, maps, params)
    return {shader=shader or M.Shader(), maps=maps or {}, params=params or {0,0,0,0}}
end

-- Transform
function M.Transform(translation, rotation, scale)
    return {translation=translation or M.Vector3(), rotation=rotation or M.Quaternion(), scale=scale or M.Vector3()}
end

-- BoneInfo
function M.BoneInfo(name, parent)
    return {name=name or "", parent=parent or -1}
end

-- ModelSkeleton
function M.ModelSkeleton(boneCount, bones, bindPose)
    return {boneCount=boneCount or 0, bones=bones or {}, bindPose=bindPose or {}}
end

-- Model
function M.Model(transform, meshCount, materialCount, meshes, materials, meshMaterial, skeleton, currentPose, boneMatrices)
    return {
        transform=transform or M.Matrix(),
        meshCount=meshCount or 0, materialCount=materialCount or 0,
        meshes=meshes or {}, materials=materials or {}, meshMaterial=meshMaterial or {},
        skeleton=skeleton or M.ModelSkeleton(),
        currentPose=currentPose or {}, boneMatrices=boneMatrices or {}
    }
end

-- ModelAnimation
function M.ModelAnimation(name, boneCount, keyframeCount, keyframePoses)
    return {name=name or "", boneCount=boneCount or 0, keyframeCount=keyframeCount or 0, keyframePoses=keyframePoses or {}}
end

-- Ray
function M.Ray(position, direction)
    return {position=position or M.Vector3(), direction=direction or M.Vector3()}
end

-- RayCollision
function M.RayCollision(hit, distance, point, normal)
    return {hit=hit or 0, distance=distance or 0, point=point or M.Vector3(), normal=normal or M.Vector3()}
end

-- BoundingBox
function M.BoundingBox(min, max)
    return {min=min or M.Vector3(), max=max or M.Vector3()}
end

-- Wave
function M.Wave(frameCount, sampleRate, sampleSize, channels, data)
    return {frameCount=frameCount or 0, sampleRate=sampleRate or 0, sampleSize=sampleSize or 0, channels=channels or 0, data=data}
end

-- AudioStream
function M.AudioStream(buffer, processor, sampleRate, sampleSize, channels)
    return {buffer=buffer, processor=processor, sampleRate=sampleRate or 0, sampleSize=sampleSize or 0, channels=channels or 0}
end

-- Sound
function M.Sound(stream, frameCount)
    return {stream=stream or M.AudioStream(), frameCount=frameCount or 0}
end

-- Music
function M.Music(stream, frameCount, looping, ctxType, ctxData)
    return {stream=stream or M.AudioStream(), frameCount=frameCount or 0, looping=looping or 0, ctxType=ctxType or 0, ctxData=ctxData}
end

-- VR structs
function M.VrDeviceInfo(hResolution,vResolution,hScreenSize,vScreenSize,eyeToScreenDistance,
                        lensSeparationDistance,interpupillaryDistance,lensDistortionValues,chromaAbCorrection)
    return {
        hResolution=hResolution or 0, vResolution=vResolution or 0,
        hScreenSize=hScreenSize or 0, vScreenSize=vScreenSize or 0,
        eyeToScreenDistance=eyeToScreenDistance or 0,
        lensSeparationDistance=lensSeparationDistance or 0,
        interpupillaryDistance=interpupillaryDistance or 0,
        lensDistortionValues=lensDistortionValues or {0,0,0,0},
        chromaAbCorrection=chromaAbCorrection or {0,0,0,0}
    }
end

function M.VrStereoConfig(projection, viewOffset, leftLensCenter, rightLensCenter, leftScreenCenter, rightScreenCenter, scale, scaleIn)
    return {
        projection=projection or {M.Matrix(), M.Matrix()},
        viewOffset=viewOffset or {M.Matrix(), M.Matrix()},
        leftLensCenter=leftLensCenter or {0,0}, rightLensCenter=rightLensCenter or {0,0},
        leftScreenCenter=leftScreenCenter or {0,0}, rightScreenCenter=rightScreenCenter or {0,0},
        scale=scale or {0,0}, scaleIn=scaleIn or {0,0}
    }
end

-- FilePathList
function M.FilePathList(count, paths)
    return {count=count or 0, paths=paths or {}}
end

-- AutomationEvent
function M.AutomationEvent(frame, type_, params)
    return {frame=frame or 0, type=type_ or 0, params=params or {0,0,0,0}}
end

-- AutomationEventList
function M.AutomationEventList(capacity, count, events)
    return {capacity=capacity or 0, count=count or 0, events=events or {}}
end


return M