"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Label } from "@/components/ui/label";
import { Download, Upload, Save, FileText } from "lucide-react";

interface SettingsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onExportData?: () => void;
  onBackupData?: () => void;
  onRestoreData?: () => void;
}

const SettingsDialog = ({
  open = false,
  onOpenChange = () => {},
  onExportData = () => {},
  onBackupData = () => {},
  onRestoreData = () => {},
}: SettingsDialogProps) => {
  const [notifications, setNotifications] = useState(true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Configurações</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Theme Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Aparência</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme" className="text-sm font-medium">
                Tema
              </Label>
              <ThemeSwitcher />
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notificações</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-sm font-medium">
                Lembrar de parcelas próximas
              </Label>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Gerenciamento de Dados</h3>

            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={onExportData}
              >
                <FileText size={16} />
                Exportar dados para CSV
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={onBackupData}
              >
                <Save size={16} />
                Fazer backup dos dados
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={onRestoreData}
              >
                <Upload size={16} />
                Restaurar dados
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
