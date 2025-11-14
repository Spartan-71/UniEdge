'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { ContainerData, generateDockerFile, OpenedFile } from './utils';
import { Button } from '@/components/ui/button';
import { Item, ItemActions, ItemContent, ItemTitle } from '@/components/ui/item';
import { Textarea } from '@/components/ui/textarea';

export default function StraceViewer() {
  const [openedFiles, setOpenedFiles] = useState<OpenedFile[]>([]);
  const [containerData, setContainerData] = useState<ContainerData>(new ContainerData(""))

  const [dockerInspection, setDockerInspection] = useState<string[]>([]);
  const [dockerFile, setDockerFile] = useState<string>("");

   const toggleOpenedFile = (index: number) => {
     const newValue = !openedFiles[index].used
     setOpenedFiles(prevItems => {
       // Create a new array with the updated item
       const newItems = [...prevItems];
       newItems[index].used = newValue
       return newItems;
     });
    };

  const handleDownload = () => {
    const blob = new Blob([dockerFile], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Dockerfile";
    a.click();

    URL.revokeObjectURL(url); // Clean up after download
  };


  const createSocket = (() => {
    const ws = new WebSocket('ws://localhost:8001');

    ws.onopen = () => {
      ws.send(JSON.stringify({"server": "ola"}))
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if(data.type == "docker") {
        if (data.Cmd !== undefined)
          containerData.cmd = data.Cmd

        setDockerInspection((prev) => [...new Set([JSON.stringify(data.data, null, 2), ...prev])]); // avoid duplicates
      }
      else {
        const openedFile = new OpenedFile(data.data, true)

        if(openedFile.filename.startsWith("/sys/") ||
           openedFile.filename.startsWith("/proc/"))
          openedFile.used = false

        console.log(openedFile)

        if(!openedFiles.some(f => f.filename === openedFile.filename)) {
          setOpenedFiles(
            (prev) => {
              if (prev.some(f => f.filename === openedFile.filename)) return prev
              else                                                    return [openedFile, ...prev]
            }
          ); // avoid duplicates
        }
      }
    };
  });

  useEffect(() => {
    setDockerFile(generateDockerFile(containerData, openedFiles))
  }, [containerData, openedFiles])

  return (
    <main className="dark bg-black min-h-screen text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Auto Unikernel Build Tool</h1>
      <Button onClick={ () => createSocket()}>Create</Button>
      <div className='grid grid-cols-2 gap-x-4'>
        <div className="h-screen grid grid-rows-2 grid-cols-1 gap-y-2">
          <Card className='overflow-scroll'>
            <CardHeader>
              Strace events
            </CardHeader>
            <CardContent>
              {openedFiles.length === 0 ? (
                <p>Waiting for file events...</p>
              ) : (
                <ul className="space-y-2">
                  {openedFiles.map((file, i) => (
                    <Item variant={file.used ? "selected" : "outline"} key={i}>
                      <ItemContent>
                        <ItemTitle>{file.filename}</ItemTitle>
                      </ItemContent>
                      <ItemActions>
                        <Button onClick = {() => { toggleOpenedFile(i) }} variant={file.used ? "destructive" : "default"} size="sm">
                          { file.used ? "REMOVE" : "ADD" }
                        </Button>
                      </ItemActions>
                    </Item>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card className='overflow-scroll'>
          <CardHeader> Docker Inspection </CardHeader>
          <CardContent>
              {dockerInspection.length === 0 ? (
                <p>Waiting for docker inspection...</p>
              ) : (
                <ul className="space-y-2">
                  {dockerInspection.map((inspect, i) => (
                  <li key={i} className="text-green-400 font-mono">
                      {inspect}
                    </li>
                  ))}
                </ul>
              )}
          </CardContent>
          </Card>
        </div>
          <Card>
          <CardHeader> 
          {
          <div className='flex flex-row'>
            Minimal Docker file Generated 

            <Button className="w-fit ml-auto" onClick={() => handleDownload()}> Download </Button>
          </div>

          }
          </CardHeader>
          <CardContent>
          {
              <p className='whitespace-pre-line font-mono'> 
                {dockerFile}
              </p>
          }
          </CardContent>
          </Card>
      </div>
    </main>
  );
}
