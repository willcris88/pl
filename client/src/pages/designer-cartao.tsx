import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MaximizedLayout } from '@/components/layout/maximized-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Upload, 
  Type, 
  Image as ImageIcon, 
  Palette, 
  RotateCcw, 
  Trash2,
  Move,
  Square,
  Circle
} from 'lucide-react';

interface DesignElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  opacity?: number;
  rotation?: number;
  zIndex: number;
  filter?: string;
  borderWidth?: number;
  borderColor?: string;
}

interface CanvasState {
  elements: DesignElement[];
  selectedElementId: string | null;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
}

export default function DesignerCartao() {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    elements: [],
    selectedElementId: null,
    canvasWidth: 800,
    canvasHeight: 600,
    zoom: 1
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementDragStart, setElementDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Adicionar elemento de texto
  const addTextElement = useCallback(() => {
    const newElement: DesignElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Texto editável',
      x: 50,
      y: 50,
      width: 200,
      height: 50,
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#000000',
      backgroundColor: 'transparent',
      opacity: 1,
      rotation: 0,
      zIndex: canvasState.elements.length + 1
    };

    setCanvasState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
      selectedElementId: newElement.id
    }));
  }, [canvasState.elements.length]);

  // Adicionar elemento de imagem
  const addImageElement = useCallback((imageUrl: string) => {
    const newElement: DesignElement = {
      id: `image-${Date.now()}`,
      type: 'image',
      content: imageUrl,
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      opacity: 1,
      rotation: 0,
      zIndex: canvasState.elements.length + 1
    };

    setCanvasState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
      selectedElementId: newElement.id
    }));
  }, [canvasState.elements.length]);

  // Adicionar forma geométrica
  const addShapeElement = useCallback((shapeType: 'rectangle' | 'circle') => {
    const newElement: DesignElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      content: shapeType,
      x: 150,
      y: 150,
      width: 100,
      height: 100,
      backgroundColor: '#3b82f6',
      borderRadius: shapeType === 'circle' ? 50 : 0,
      opacity: 1,
      rotation: 0,
      zIndex: canvasState.elements.length + 1
    };

    setCanvasState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
      selectedElementId: newElement.id
    }));
  }, [canvasState.elements.length]);

  // Lidar com upload de imagem
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        addImageElement(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  }, [addImageElement]);

  // Selecionar elemento
  const selectElement = useCallback((elementId: string) => {
    setCanvasState(prev => ({
      ...prev,
      selectedElementId: elementId
    }));
  }, []);

  // Deletar elemento selecionado
  const deleteSelectedElement = useCallback(() => {
    if (canvasState.selectedElementId) {
      setCanvasState(prev => ({
        ...prev,
        elements: prev.elements.filter(el => el.id !== prev.selectedElementId),
        selectedElementId: null
      }));
    }
  }, [canvasState.selectedElementId]);

  // Atualizar elemento selecionado
  const updateSelectedElement = useCallback((updates: Partial<DesignElement>) => {
    if (canvasState.selectedElementId) {
      setCanvasState(prev => ({
        ...prev,
        elements: prev.elements.map(el => 
          el.id === prev.selectedElementId 
            ? { ...el, ...updates }
            : el
        )
      }));
    }
  }, [canvasState.selectedElementId]);

  // Lidar com início do drag
  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = canvasState.elements.find(el => el.id === elementId);
    if (!element) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setElementDragStart({ x: element.x, y: element.y });
    selectElement(elementId);
  }, [canvasState.elements, selectElement]);

  // Lidar com movimento do drag
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !canvasState.selectedElementId) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    updateSelectedElement({
      x: Math.max(0, Math.min(canvasState.canvasWidth - 50, elementDragStart.x + deltaX)),
      y: Math.max(0, Math.min(canvasState.canvasHeight - 50, elementDragStart.y + deltaY))
    });
  }, [isDragging, canvasState.selectedElementId, dragStart, elementDragStart, updateSelectedElement, canvasState.canvasWidth, canvasState.canvasHeight]);

  // Lidar com fim do drag
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Exportar canvas como imagem
  const exportCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    // Criar um canvas temporário para exportar
    const canvas = document.createElement('canvas');
    canvas.width = canvasState.canvasWidth;
    canvas.height = canvasState.canvasHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Fundo branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Renderizar elementos por ordem de z-index
    const sortedElements = [...canvasState.elements].sort((a, b) => a.zIndex - b.zIndex);

    sortedElements.forEach(element => {
      ctx.save();
      ctx.globalAlpha = element.opacity || 1;
      
      // Aplicar transformação de posição
      ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
      ctx.rotate((element.rotation || 0) * Math.PI / 180);
      ctx.translate(-element.width / 2, -element.height / 2);

      if (element.type === 'text') {
        ctx.fillStyle = element.color || '#000000';
        ctx.font = `${element.fontSize || 24}px ${element.fontFamily || 'Arial'}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(element.content, 0, 0);
      } else if (element.type === 'shape') {
        ctx.fillStyle = element.backgroundColor || '#3b82f6';
        if (element.content === 'circle') {
          ctx.beginPath();
          ctx.arc(element.width / 2, element.height / 2, element.width / 2, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, element.width, element.height);
        }
      }

      ctx.restore();
    });

    // Download da imagem
    const link = document.createElement('a');
    link.download = `cartao-condolencias-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, [canvasState]);

  const selectedElement = canvasState.elements.find(el => el.id === canvasState.selectedElementId);

  return (
    <MaximizedLayout>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar de ferramentas */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Designer de Cartão</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Crie cartões de condolências profissionais</p>
          </div>

          <Tabs defaultValue="elementos" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
              <TabsTrigger value="elementos">Elementos</TabsTrigger>
              <TabsTrigger value="propriedades">Propriedades</TabsTrigger>
            </TabsList>

            <TabsContent value="elementos" className="flex-1 p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Adicionar Elementos</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addTextElement}
                    className="flex items-center gap-2"
                  >
                    <Type className="w-4 h-4" />
                    Texto
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Imagem
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addShapeElement('rectangle')}
                    className="flex items-center gap-2"
                  >
                    <Square className="w-4 h-4" />
                    Retângulo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addShapeElement('circle')}
                    className="flex items-center gap-2"
                  >
                    <Circle className="w-4 h-4" />
                    Círculo
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Modelos Predefinidos</Label>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Modelo básico de cartão
                      const elementos = [
                        {
                          id: 'titulo',
                          type: 'text' as const,
                          content: 'EM MEMÓRIA',
                          x: 50,
                          y: 30,
                          width: 700,
                          height: 60,
                          fontSize: 48,
                          fontFamily: 'Georgia',
                          color: '#2d3748',
                          backgroundColor: 'transparent',
                          opacity: 1,
                          rotation: 0,
                          zIndex: 1
                        },
                        {
                          id: 'nome',
                          type: 'text' as const,
                          content: 'Nome do Falecido',
                          x: 50,
                          y: 120,
                          width: 700,
                          height: 80,
                          fontSize: 36,
                          fontFamily: 'Arial',
                          color: '#1a202c',
                          backgroundColor: 'transparent',
                          opacity: 1,
                          rotation: 0,
                          zIndex: 2
                        },
                        {
                          id: 'data-nasc',
                          type: 'text' as const,
                          content: 'Data de Nascimento: __/__/____',
                          x: 50,
                          y: 220,
                          width: 350,
                          height: 40,
                          fontSize: 18,
                          fontFamily: 'Arial',
                          color: '#4a5568',
                          backgroundColor: 'transparent',
                          opacity: 1,
                          rotation: 0,
                          zIndex: 3
                        },
                        {
                          id: 'data-falec',
                          type: 'text' as const,
                          content: 'Data de Falecimento: __/__/____',
                          x: 400,
                          y: 220,
                          width: 350,
                          height: 40,
                          fontSize: 18,
                          fontFamily: 'Arial',
                          color: '#4a5568',
                          backgroundColor: 'transparent',
                          opacity: 1,
                          rotation: 0,
                          zIndex: 4
                        },
                        {
                          id: 'velorio',
                          type: 'text' as const,
                          content: 'Velório: Local, Data e Hora',
                          x: 50,
                          y: 350,
                          width: 700,
                          height: 40,
                          fontSize: 20,
                          fontFamily: 'Arial',
                          color: '#2d3748',
                          backgroundColor: 'transparent',
                          opacity: 1,
                          rotation: 0,
                          zIndex: 5
                        },
                        {
                          id: 'sepultamento',
                          type: 'text' as const,
                          content: 'Sepultamento: Local, Data e Hora',
                          x: 50,
                          y: 400,
                          width: 700,
                          height: 40,
                          fontSize: 20,
                          fontFamily: 'Arial',
                          color: '#2d3748',
                          backgroundColor: 'transparent',
                          opacity: 1,
                          rotation: 0,
                          zIndex: 6
                        },
                        {
                          id: 'foto-placeholder',
                          type: 'shape' as const,
                          content: 'circle',
                          x: 600,
                          y: 100,
                          width: 150,
                          height: 150,
                          backgroundColor: '#e2e8f0',
                          borderRadius: 50,
                          opacity: 1,
                          rotation: 0,
                          zIndex: 7
                        }
                      ];

                      setCanvasState(prev => ({
                        ...prev,
                        elements: elementos,
                        selectedElementId: null
                      }));
                    }}
                    className="w-full"
                  >
                    Modelo Básico
                  </Button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </TabsContent>

            <TabsContent value="propriedades" className="flex-1 p-4">
              {selectedElement ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Elemento Selecionado</Label>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={deleteSelectedElement}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">X</Label>
                        <Input
                          type="number"
                          value={selectedElement.x}
                          onChange={(e) => updateSelectedElement({ x: parseInt(e.target.value) || 0 })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Y</Label>
                        <Input
                          type="number"
                          value={selectedElement.y}
                          onChange={(e) => updateSelectedElement({ y: parseInt(e.target.value) || 0 })}
                          className="h-8"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Largura</Label>
                        <Input
                          type="number"
                          value={selectedElement.width}
                          onChange={(e) => updateSelectedElement({ width: parseInt(e.target.value) || 0 })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Altura</Label>
                        <Input
                          type="number"
                          value={selectedElement.height}
                          onChange={(e) => updateSelectedElement({ height: parseInt(e.target.value) || 0 })}
                          className="h-8"
                        />
                      </div>
                    </div>

                    {selectedElement.type === 'text' && (
                      <>
                        <div>
                          <Label className="text-xs">Texto</Label>
                          <Input
                            value={selectedElement.content}
                            onChange={(e) => updateSelectedElement({ content: e.target.value })}
                            className="h-8"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Tamanho</Label>
                            <Input
                              type="number"
                              value={selectedElement.fontSize || 24}
                              onChange={(e) => updateSelectedElement({ fontSize: parseInt(e.target.value) || 24 })}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Cor</Label>
                            <Input
                              type="color"
                              value={selectedElement.color || '#000000'}
                              onChange={(e) => updateSelectedElement({ color: e.target.value })}
                              className="h-8"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {selectedElement.type === 'image' && (
                      <>
                        <div>
                          <Label className="text-xs">Formato da Imagem</Label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <Button
                              variant={selectedElement.borderRadius === 0 ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateSelectedElement({ borderRadius: 0 })}
                            >
                              Quadrada
                            </Button>
                            <Button
                              variant={selectedElement.borderRadius === 50 ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateSelectedElement({ borderRadius: 50 })}
                            >
                              Redonda
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Bordas Arredondadas</Label>
                          <Input
                            type="range"
                            min="0"
                            max="50"
                            step="1"
                            value={selectedElement.borderRadius || 0}
                            onChange={(e) => updateSelectedElement({ borderRadius: parseInt(e.target.value) })}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Filtros Visuais</Label>
                          <div className="grid grid-cols-2 gap-1 mt-1">
                            <Button
                              variant={!selectedElement.filter ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateSelectedElement({ filter: undefined })}
                            >
                              Normal
                            </Button>
                            <Button
                              variant={selectedElement.filter === "grayscale(100%)" ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateSelectedElement({ filter: "grayscale(100%)" })}
                            >
                              P&B
                            </Button>
                            <Button
                              variant={selectedElement.filter === "sepia(100%)" ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateSelectedElement({ filter: "sepia(100%)" })}
                            >
                              Sépia
                            </Button>
                            <Button
                              variant={selectedElement.filter === "blur(2px)" ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateSelectedElement({ filter: "blur(2px)" })}
                            >
                              Desfoque
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Borda da Imagem</Label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div>
                              <Label className="text-xs">Largura</Label>
                              <Input
                                type="range"
                                min="0"
                                max="10"
                                step="1"
                                value={selectedElement.borderWidth || 0}
                                onChange={(e) => updateSelectedElement({ borderWidth: parseInt(e.target.value) })}
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Cor</Label>
                              <Input
                                type="color"
                                value={selectedElement.borderColor || '#000000'}
                                onChange={(e) => updateSelectedElement({ borderColor: e.target.value })}
                                className="h-8"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {selectedElement.type === 'shape' && (
                      <div>
                        <Label className="text-xs">Cor de Fundo</Label>
                        <Input
                          type="color"
                          value={selectedElement.backgroundColor || '#3b82f6'}
                          onChange={(e) => updateSelectedElement({ backgroundColor: e.target.value })}
                          className="h-8"
                        />
                      </div>
                    )}

                    <div>
                      <Label className="text-xs">Opacidade ({Math.round((selectedElement.opacity || 1) * 100)}%)</Label>
                      <Input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={selectedElement.opacity || 1}
                        onChange={(e) => updateSelectedElement({ opacity: parseFloat(e.target.value) })}
                        className="h-8"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Rotação ({selectedElement.rotation || 0}°)</Label>
                      <Input
                        type="range"
                        min="-180"
                        max="180"
                        step="5"
                        value={selectedElement.rotation || 0}
                        onChange={(e) => updateSelectedElement({ rotation: parseInt(e.target.value) })}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <Move className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Selecione um elemento para editar suas propriedades</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={exportCanvas} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Exportar PNG
            </Button>
          </div>
        </div>

        {/* Área do canvas */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Canvas de Design
              </h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCanvasState(prev => ({ ...prev, elements: [], selectedElementId: null }))}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-8">
            <div className="flex justify-center">
              <div
                ref={canvasRef}
                className="relative bg-white shadow-lg border border-gray-200 dark:border-gray-700"
                style={{
                  width: canvasState.canvasWidth,
                  height: canvasState.canvasHeight,
                  transform: `scale(${canvasState.zoom})`
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onClick={() => setCanvasState(prev => ({ ...prev, selectedElementId: null }))}
              >
                {canvasState.elements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute cursor-move select-none ${
                      element.id === canvasState.selectedElementId ? 'ring-2 ring-blue-500' : ''
                    }`}
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      zIndex: element.zIndex,
                      opacity: element.opacity || 1,
                      transform: `rotate(${element.rotation || 0}deg)`
                    }}
                    onMouseDown={(e) => handleMouseDown(e, element.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectElement(element.id);
                    }}
                  >
                    {element.type === 'text' && (
                      <div
                        style={{
                          fontSize: element.fontSize || 24,
                          fontFamily: element.fontFamily || 'Arial',
                          color: element.color || '#000000',
                          backgroundColor: element.backgroundColor || 'transparent',
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px',
                          boxSizing: 'border-box'
                        }}
                      >
                        {element.content}
                      </div>
                    )}

                    {element.type === 'image' && (
                      <img
                        src={element.content}
                        alt="Elemento"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: element.borderRadius || 0,
                          filter: element.filter || 'none',
                          border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor || '#000000'}` : 'none'
                        }}
                        draggable={false}
                      />
                    )}

                    {element.type === 'shape' && (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: element.backgroundColor || '#3b82f6',
                          borderRadius: element.borderRadius || 0
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MaximizedLayout>
  );
}