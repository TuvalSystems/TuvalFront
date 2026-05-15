<script setup>
import BaseBlock from '@/components/BaseBlock.vue';
import { onMounted } from 'vue';

onMounted(() => { });
</script>

<template>
  <BasePageHeading title="Gestión de Perfiles">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Sistemas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Seguridad</li>
          <li class="breadcrumb-item" aria-current="page">Perfiles</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>

  <div class="content">
    <div class="row">
      <!-- Lista de perfiles -->
      <div class="col-md-6">
        <BaseBlock title="Perfiles de usuario" class="mb-2">
          <template #options>
            <button type="button" class="btn btn-success btn-sm">
              <i class="fa fa-plus me-1"></i>
              Crear perfil
            </button>
          </template>

          <p class="fs-sm text-muted">
            Administra los perfiles de acceso por plataforma.
          </p>

          <!-- Filtros -->
          <div class="row g-2 mb-4">
            <div class="col-md-4">
              <div class="form-floating">
                <select id="filter-platform" class="form-select form-select-sm">
                  <option value="web">Web</option>
                  <option value="app">App</option>
                </select>
                <label for="filter-platform">Plataforma</label>
              </div>
            </div>

            <div class="col-md-4">
              <div class="form-floating">
                <select id="filter-status" class="form-select form-select-sm">
                  <option value="">Todos</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
                <label for="filter-status">Estado</label>
              </div>
            </div>

            <div class="col-md-4">
              <div class="form-floating">
                <input id="filter-search" type="text" class="form-control form-control-sm" placeholder="Buscar perfil">
                <label for="filter-search">
                  Buscar
                </label>
              </div>
            </div>
          </div>

          <!-- Lista -->
          <div class="profile-list">
            <!-- Perfil seleccionado -->
            <div class="profile-item active">
              <div class="profile-avatar bg-primary text-white">
                <i class="fa fa-user"></i>
              </div>

              <div class="profile-info">
                <div class="fw-semibold">Administrador Web</div>
                <div class="fs-sm text-muted">
                  Perfil principal para administración web
                </div>
              </div>

              <div class="profile-meta">
                <span class="badge bg-info-light text-info">Web</span>
                <span class="badge bg-success-light text-success">Activo</span>

                <button type="button" class="btn btn-sm btn-alt-secondary">
                  <i class="fa fa-pencil-alt"></i>
                </button>
              </div>
            </div>

            <div class="profile-item">
              <div class="profile-avatar bg-body-dark text-muted">
                <i class="fa fa-user"></i>
              </div>

              <div class="profile-info">
                <div class="fw-semibold">Vendedor Web</div>
                <div class="fs-sm text-muted">
                  Acceso operativo de ventas
                </div>
              </div>

              <div class="profile-meta">
                <span class="badge bg-info-light text-info">Web</span>
                <span class="badge bg-success-light text-success">Activo</span>

                <button type="button" class="btn btn-sm btn-alt-secondary">
                  <i class="fa fa-pencil-alt"></i>
                </button>
              </div>
            </div>

            <div class="profile-item">
              <div class="profile-avatar bg-body-dark text-muted">
                <i class="fa fa-user"></i>
              </div>

              <div class="profile-info">
                <div class="fw-semibold">Bodega App</div>
                <div class="fs-sm text-muted">
                  Perfil para operaciones móviles
                </div>
              </div>

              <div class="profile-meta">
                <span class="badge bg-primary-light text-primary">App</span>
                <span class="badge bg-success-light text-success">Activo</span>

                <button type="button" class="btn btn-sm btn-alt-secondary">
                  <i class="fa fa-pencil-alt"></i>
                </button>
              </div>
            </div>

            <div class="profile-item">
              <div class="profile-avatar bg-body-dark text-muted">
                <i class="fa fa-user"></i>
              </div>

              <div class="profile-info">
                <div class="fw-semibold">Supervisor App</div>
                <div class="fs-sm text-muted">
                  Supervisión de procesos móviles
                </div>
              </div>

              <div class="profile-meta">
                <span class="badge bg-primary-light text-primary">App</span>
                <span class="badge bg-danger-light text-danger">Inactivo</span>

                <button type="button" class="btn btn-sm btn-alt-secondary">
                  <i class="fa fa-pencil-alt"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="fs-sm text-muted mt-3">
            Mostrando 4 perfiles.
          </div>
        </BaseBlock>
      </div>

      <!-- Formulario -->
      <div class="col-md-6">
        <BaseBlock title="Datos del perfil" class="mb-2">
          <p class="fs-sm text-muted">
            Define el nombre, plataforma y estado del perfil.
          </p>

          <div class="row g-3 mb-2">
            <div class="col-12">
              <div class="form-floating">
                <input id="profile-name" type="text" class="form-control" placeholder="Nombre"
                  value="Administrador Web">
                <label for="profile-name">Nombre</label>
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-floating">
                <select id="profile-platform" class="form-select">
                  <option value="web">Web</option>
                  <option value="app">App</option>
                </select>
                <label for="profile-platform">Plataforma</label>
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-floating">
                <select id="profile-status" class="form-select">
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
                <label for="profile-status">Estado</label>
              </div>
            </div>

            <div class="col-12">
              <div class="alert alert-info mb-0">
                <i class="fa fa-info-circle me-1"></i>
                Las secciones disponibles dependerán de la plataforma seleccionada.
              </div>
            </div>

            <div class="col-12 d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-alt-secondary">
                Cancelar
              </button>

              <button type="button" class="btn btn-primary">
                <i class="fa fa-save me-1"></i>
                Guardar cambios
              </button>
            </div>
          </div>
        </BaseBlock>
      </div>
    </div>

    <!-- Accesos -->
    <div class="row">
      <div class="col-md-12">
        <BaseBlock title="Accesos del perfil" class="mb-2">
          <template #options>
            <span class="badge bg-info-light text-info">
              Web
            </span>
          </template>

          <p class="fs-sm text-muted mb-3">
            Secciones habilitadas para el perfil seleccionado.
          </p>

          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
            <div>
              <div class="fw-semibold">
                Perfil: Administrador Web
              </div>
              <div class="fs-sm text-muted">
                Plataforma: Web
              </div>
            </div>

            <div class="d-flex flex-wrap gap-2">
              <div class="input-group input-group-sm permission-search">
                <span class="input-group-text">
                  <i class="fa fa-search"></i>
                </span>
                <input type="text" class="form-control" placeholder="Buscar sección...">
              </div>

              <button type="button" class="btn btn-sm btn-alt-primary">
                <i class="fa fa-check me-1"></i>
                Marcar todo
              </button>

              <button type="button" class="btn btn-sm btn-alt-secondary">
                <i class="fa fa-times me-1"></i>
                Limpiar
              </button>

              <button type="button" class="btn btn-sm btn-alt-secondary">
                <i class="fa fa-expand me-1"></i>
                Expandir todo
              </button>
            </div>
          </div>

          <div class="row">
            <!-- Columna 1 -->
            <div class="col-md-4">
              <div class="permission-group">
                <div class="form-check mb-3">
                  <input id="sec-dashboard" class="form-check-input" type="checkbox" checked>
                  <label class="form-check-label fw-semibold" for="sec-dashboard">
                    <i class="fa fa-home me-1 text-muted"></i>
                    Dashboard
                  </label>
                </div>
              </div>

              <div class="permission-group">
                <div class="form-check mb-2">
                  <input id="sec-ventas" class="form-check-input" type="checkbox" checked>
                  <label class="form-check-label fw-semibold" for="sec-ventas">
                    <i class="fa fa-shopping-cart me-1 text-muted"></i>
                    Ventas
                  </label>
                </div>

                <div class="permission-children">
                  <div class="form-check mb-2">
                    <input id="sec-cotizaciones" class="form-check-input" type="checkbox" checked>
                    <label class="form-check-label" for="sec-cotizaciones">
                      Cotizaciones
                    </label>
                  </div>

                  <div class="form-check mb-2">
                    <input id="sec-pedidos" class="form-check-input" type="checkbox" checked>
                    <label class="form-check-label" for="sec-pedidos">
                      Pedidos
                    </label>
                  </div>

                  <div class="form-check mb-2">
                    <input id="sec-facturacion" class="form-check-input" type="checkbox">
                    <label class="form-check-label" for="sec-facturacion">
                      Facturación
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Columna 2 -->
            <div class="col-md-4">
              <div class="permission-group">
                <div class="form-check mb-2">
                  <input id="sec-inventario" class="form-check-input" type="checkbox" checked>
                  <label class="form-check-label fw-semibold" for="sec-inventario">
                    <i class="fa fa-box me-1 text-muted"></i>
                    Inventario
                  </label>
                </div>

                <div class="permission-children">
                  <div class="form-check mb-2">
                    <input id="sec-reservas" class="form-check-input" type="checkbox" checked>
                    <label class="form-check-label fw-semibold" for="sec-reservas">
                      Reservas
                    </label>
                  </div>

                  <div class="permission-children">
                    <div class="form-check mb-2">
                      <input id="sec-solicitud-reserva" class="form-check-input" type="checkbox" checked>
                      <label class="form-check-label" for="sec-solicitud-reserva">
                        Solicitud de reserva
                      </label>
                    </div>

                    <div class="form-check mb-2">
                      <input id="sec-aprobacion-reserva" class="form-check-input" type="checkbox" checked>
                      <label class="form-check-label" for="sec-aprobacion-reserva">
                        Aprobación de reserva
                      </label>
                    </div>

                    <div class="form-check mb-2">
                      <input id="sec-factura-demanda" class="form-check-input" type="checkbox">
                      <label class="form-check-label" for="sec-factura-demanda">
                        Factura demanda
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Columna 3 -->
            <div class="col-md-4">
              <div class="permission-group">
                <div class="form-check mb-2">
                  <input id="sec-admin" class="form-check-input" type="checkbox">
                  <label class="form-check-label fw-semibold" for="sec-admin">
                    <i class="fa fa-cog me-1 text-muted"></i>
                    Administración
                  </label>
                </div>

                <div class="permission-children">
                  <div class="form-check mb-2">
                    <input id="sec-usuarios" class="form-check-input" type="checkbox">
                    <label class="form-check-label" for="sec-usuarios">
                      Usuarios
                    </label>
                  </div>

                  <div class="form-check mb-2">
                    <input id="sec-perfiles" class="form-check-input" type="checkbox">
                    <label class="form-check-label" for="sec-perfiles">
                      Perfiles
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BaseBlock>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem;
  border: 1px solid rgba(0, 0, 0, 0.055);
  border-radius: 0.5rem;
  background: #fff;
  transition: all 0.15s ease-in-out;
}

.profile-item:hover {
  border-color: rgba(13, 110, 253, 0.25);
  background: rgba(13, 110, 253, 0.035);
}

.profile-item.active {
  border-color: rgba(13, 110, 253, 0.45);
  background: rgba(13, 110, 253, 0.08);
}

.profile-avatar {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}

.profile-info {
  min-width: 0;
  flex: 1;
}

.profile-meta {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.permission-search {
  width: 240px;
}

.permission-group {
  margin-bottom: 1rem;
}

.permission-children {
  margin-left: 1.5rem;
  padding-left: 1rem;
  border-left: 1px solid rgba(0, 0, 0, 0.08);
}

.form-check-label {
  cursor: pointer;
}

@media (max-width: 767.98px) {
  .profile-item {
    align-items: flex-start;
  }

  .profile-meta {
    justify-content: flex-start;
  }

  .permission-search {
    width: 100%;
  }
}
</style>