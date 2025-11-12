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
     console.log("called here")
     const newValue = !openedFiles[index].used
     setOpenedFiles(prevItems => {
       // Create a new array with the updated item
       const newItems = [...prevItems];
       console.log(`called before => ${newItems[index].used}`)
       newItems[index].used = newValue
       console.log(`called after => ${newItems[index].used}`)
       return newItems;
     });
    };

  const handleDownload = () => {
    const blob = new Blob([dockerFile], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "myfile.txt";
    a.click();

    URL.revokeObjectURL(url); // Clean up after download
  };


  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8001');

    ws.onopen = () => {
      console.log("sending initiation")
      ws.send(JSON.stringify({"server": "ola"}))
    }

    ws.onmessage = (event) => {
      console.log(event.data)
      const data = JSON.parse(event.data)
      if(data.type == "docker") {
        if (data.Cmd !== undefined)
          containerData.cmd = data.Cmd

        setDockerInspection((prev) => [...new Set([JSON.stringify(data.data, null, 2), ...prev])]); // avoid duplicates
      }
      else {
        console.log(data.data)
        const openedFile = new OpenedFile(data.data, true)
        if(openedFile.filename.startsWith("/sys/") ||
           openedFile.filename.startsWith("/sys/"))
          openedFile.used = false

        setOpenedFiles((prev) => [...new Set([new OpenedFile(data.data, false), ...prev])]); // avoid duplicates
      }
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    setDockerFile(generateDockerFile(openedFiles))
  }, [openedFiles])

  return (
    <main className="dark bg-black min-h-screen text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Auto Unikernel Build Tool</h1>
      <div className="flex flex-col gap-y-2">
      <Card>
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
          <Item variant="outline">
            <ItemContent>
              <Textarea placeholder='Add a file'>Add a file</Textarea>
            </ItemContent>
            <ItemActions>
              <Button onClick = {() => { toggleOpenedFile(i) }} variant={file.used ? "destructive" : "default"} size="sm">
                { file.used ? "REMOVE" : "ADD" }
              </Button>
            </ItemActions>
          </Item>
        </CardContent>
      </Card>
      <Separator />
      <Card>
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
      <Separator />
      <Card>
      <CardHeader> Minimal Docker file Generated </CardHeader>
      <CardContent>
      {
          <p className='whitespace-pre-line font-mono'> 
            {dockerFile}
          </p>
      }
      </CardContent>
      </Card>
        <Button className="w-fit ml-auto" onClick={() => handleDownload()}> Download </Button>
      </div>
    </main>
  );
}
